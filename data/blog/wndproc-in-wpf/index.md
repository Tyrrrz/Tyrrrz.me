---
title: 'Custom WndProc Handlers in WPF'
date: '2017-02-02'
---

WndProc is a callback function that takes care of system messages sent from the operating system. Unlike WinForms, in WPF, it's not directly exposed to you as it's hidden beneath the framework's layer of abstraction.

There are times, however, when you need to process these messages manually, for example when dealing with Windows API. Let's look at some ways that we can do it.

## Non-MVVM way

We can use these special helper methods to get the handle of one of the windows, and then add a hook to it:

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

In the example above we use the application's main window as the host, as it typically stays open for as long as the application is running. You can specify a different window through a parameter in the `FromVisual(...)` method, but then make sure to call `source.RemoveHook(...)` and `source.Dispose()` after you're done.

The above approach suffers from not being MVVM-friendly — the `WndProc(...)` method, which will most likely be defined in the model layer, is actually coupled to a window. As a result, it can introduce a circular dependency between the view and the model, which may often lead to undesirable consequences.

## MVVM way

As an alternative, we can decouple message processing from the view layer by creating a specialized invisible "sponge" window.

Conveniently, `System.Windows.Forms.NativeWindow` fits exactly this purpose — it's a low level window class that does nothing else but listen to system messages. We can use it by adding a reference to the `System.Windows.Forms` assembly.

Here is how I defined my sponge window:

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

Make sure you don't forget to call `base.WndProc(ref m)`, otherwise the window will not initialize correctly.

Now, assuming we have some sort of `WndProcService`, we can use our sponge window like so:

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
        // window messages with sponge's handle.
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

By handling the `WndProcCalled` event, you can listen to incoming messages. Typically, you would want to call some Windows API method that subscribes a window to additional WndProc messages using its handle, e.g. [`RegisterPowerSettingNotification(...)`](https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-registerpowersettingnotification) or [`RegisterHotKey(...)`](https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-registerhotkey).

For example, if we were interested in registering a global hotkey and listening to its events, we could do it in such way:

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
        // Only interested in hotkey messages, so skip others
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
