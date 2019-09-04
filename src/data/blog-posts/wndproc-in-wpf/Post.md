---
title: WndProc in WPF
date: 2017-02-02
---

WndProc is a callback function implemented by all windows that takes care of system messages sent from the operating system. In WPF, it's not directly exposed as it's hidden by abstraction, however there are times when you may want to process the events yourself -- global hotkeys being a common use case.

Contrary to what many people seem to think (according to StackOverflow answers, at least), being able to process window messages in WPF is both required and is definitely possible.

## Non-MVVM way

You can use special helper functions to get the handle of one of the windows, and then add a hook to it.

```csharp
var window = Application.Current.MainWindow;
var source = HwndSource.FromHwnd(new WindowInteropHelper(window).Handle);
source.AddHook(WndProc);

private IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
{
    // Handle messages...

    return IntPtr.Zero;
}
```

This will use the application's main window as the host, as it's typically the window that stays open for as long as the application is running. You can specify a different window as a parameter to `FromVisual(…)` method, but then make sure to call `source.RemoveHook(…)` and `source.Dispose()` after you're done.

The above approach suffers from not being MVVM-compliant -- the WndProc code, which will most likely be defined in the model layer, is actually tied to a window. As a result, it can introduce a circular dependency between view and model, where one will wait on the other to initialize.

## MVVM-compliant way

You can decouple message processing from the view layer by creating a specialized invisible "sponge" window which will be used in the model layer to consume and process messages. Conveniently, `System.Windows.Forms.NativeWindow` fits exactly this purpose -- it's a low level window class that does nothing else but listen to system messages.

### Implementing a message sponge

To define a low-level sponge window you can extend the `NativeWindow` class. You need to reference `System.Windows.Forms` to use it.

```csharp
public sealed class SpongeWindow : NativeWindow
{
    public event EventHandler<Message> WndProcCalled;

    public SpongeWindow()
    {
        CreateHandle(new CreateParams());
    }

    protected override void WndProc(ref Message m)
    {
        WndProcCalled?.Invoke(this, m);
        base.WndProc(ref m); // don't forget this line
    }
}
```

It's important to not forget the `base.WndProc(ref m)` line, because one of the first messages the sponge will have to process is the message informing of its own creation. Basically, if you forget to add the `base` call, nothing will work.

### Usage

```csharp
public class WndProcService : IDisposable
{
    private readonly SpongeWindow _sponge;

    public WndProcService()
    {
        _sponge = new SpongeWindow();
        _sponge.WndProcCalled += (s, e) => ProcessMessage(e);

        RegisterMessages();
    }

    private void RegisterMessages()
    {
        // Some Windows API calls here to register
        // window messages with sponge's handle
    }

    private void ProcessMessage(Message message)
    {
        // Here we process incoming messages
    }

    public void Dispose()
    {
        _sponge.Dispose();
    }
}
```

By subscribing to `WndProcCalled` event you can listen to incoming messages. You can also register to additional window messages by passing sponge's handle as parameter to specific WinAPI methods.

For example, to register and listen to global hotkey events you can do:

```csharp
public class GlobalHotkeyService : IDisposable
{
    [DllImport("user32.dll", EntryPoint = "RegisterHotKey", SetLastError = true)]
    private static extern bool RegisterHotKey(IntPtr hWnd, int id, int fsModifiers, int vk);

    private readonly SpongeWindow _sponge;

    public GlobalHotkeyService()
    {
        _sponge = new SpongeWindow();
        _sponge.WndProcCalled += (s, e) => ProcessMessage(e);

        RegisterMessages();
    }

    private void RegisterMessages()
    {
        // Register F1 as a global hotkey
        var id = 1;
        RegisterHotKey(_sponge.Handle, id, 0, 0x70);
    }

    private void ProcessMessage(Message message)
    {
        // Only interested in hotkey messages so skip others
        if (message.Msg != 0x0312)
            return;

        // Get hotkey id
        var id = message.WParam.ToInt32();

        // Do something else...
    }

    public void Dispose()
    {
        _sponge.Dispose();
    }
}
```
