---
title: 'WPF ListBox SelectedItems TwoWay Binding'
date: '2016-11-01'
---

For some unclear reasons, WPF's `ListBox` control does not allow two-way binding on the `SelectedItems` property the way it does with `SelectedItem`. This could have been very useful when using multi-select to bind the whole list of selected items to the view model.

Interestingly, you can still call `Add()`, `Remove()`, `Clear()` methods on `ListBox.SelectedItems` which updates the selection correctly, so it just comes down to implementing a behavior that makes the property bindable.

## Behavior implementation

Here's the behavior that allows two-way binding on `SelectedItems`:

```csharp
public class ListBoxSelectionBehavior<T> : Behavior<ListBox>
{
    public static readonly DependencyProperty SelectedItemsProperty =
        DependencyProperty.Register(
            nameof(SelectedItems),
            typeof(IList),
            typeof(ListBoxSelectionBehavior),
            new FrameworkPropertyMetadata(
                null,
                FrameworkPropertyMetadataOptions.BindsTwoWayByDefault,
                OnSelectedItemsChanged
            )
        );

    private static void OnSelectedItemsChanged(DependencyObject sender, DependencyPropertyChangedEventArgs args)
    {
        var behavior = (ListBoxSelectionBehavior) sender;
        if (behavior._modelHandled) return;

        if (behavior.AssociatedObject == null)
            return;

        behavior._modelHandled = true;
        behavior.SelectItems();
        behavior._modelHandled = false;
    }

    private bool _viewHandled;
    private bool _modelHandled;

    public IList SelectedItems
    {
        get => (IList) GetValue(SelectedItemsProperty);
        set => SetValue(SelectedItemsProperty, value);
    }

    // Propagate selected items from model to view
    private void SelectItems()
    {
        _viewHandled = true;
        AssociatedObject.SelectedItems.Clear();
        if (SelectedItems != null)
        {
            foreach (var item in SelectedItems)
                AssociatedObject.SelectedItems.Add(item);
        }
        _viewHandled = false;
    }

    // Propagate selected items from view to model
    private void OnListBoxSelectionChanged(object sender, SelectionChangedEventArgs args)
    {
        if (_viewHandled) return;
        if (AssociatedObject.Items.SourceCollection == null) return;

        SelectedItems = AssociatedObject.SelectedItems.Cast<T>().ToArray();
    }

    // Re-select items when the set of items changes
    private void OnListBoxItemsChanged(object sender, NotifyCollectionChangedEventArgs args)
    {
        if (_viewHandled) return;
        if (AssociatedObject.Items.SourceCollection == null) return;

        SelectItems();
    }

    protected override void OnAttached()
    {
        base.OnAttached();

        AssociatedObject.SelectionChanged += OnListBoxSelectionChanged;
        ((INotifyCollectionChanged) AssociatedObject.Items).CollectionChanged += OnListBoxItemsChanged;
    }

    /// <inheritdoc />
    protected override void OnDetaching()
    {
        base.OnDetaching();

        if (AssociatedObject != null)
        {
            AssociatedObject.SelectionChanged -= OnListBoxSelectionChanged;
            ((INotifyCollectionChanged) AssociatedObject.Items).CollectionChanged -= OnListBoxItemsChanged;
        }
    }
}
```

The behavior above defines its own `SelectedItems` property, identical to the one in `ListBox`, except it can be bound to and is not read-only.

When the property is changed from the view model, the `OnSelectedItemsChanged(...)` method is called, which is where the changes are propagated to the view. We do that in the `SelectItems()` method where we just clear and add new items to the `ListBox.SelectedItems` collection.

When the change is triggered by the view, we call the `OnListBoxSelectionChanged(...)` method. To update the selected items on the view model, we copy the items from `ListBox.SelectedItems` to our own `SelectedItems` collection.

Note that this behavior is generic because we expect to be able to bind to a collection of an arbitrary type on the view model's side. WPF doesn't support generic behaviors, however, so we have to subtype this class for each specific data type:

```csharp
public class MyObjectListBoxSelectionBehavior : ListBoxSelectionBehavior<MyObject>
{
}
```

## Usage

We can now use this behavior by initializing it in XAML, like this:

```xml
<ListBox ItemsSource="{Binding Items}" SelectionMode="Multiple">
    <i:Interaction.Behaviors>
        <behaviors:MyObjectListBoxSelectionBehavior SelectedItems="{Binding SelectedItems}" />
    </i:Interaction.Behaviors>
    <ListBox.ItemTemplate>
        <!-- ... -->
    </ListBox.ItemTemplate>
</ListBox>
```

## Adding support for SelectedValuePath

Another useful feature of `ListBox` is that you can make a binding proxy using `SelectedValuePath` and `SelectedValue`. Setting `SelectedValuePath` lets you specify a member path to be evaluated by `SelectedValue`.

The great part about it is that it also works the other way around — changing `SelectedValue` will use the member path in `SelectedValuePath` to update `SelectedItem` with a new reference.

This could also be very useful for multi-select, but unfortunately the plural version, `SelectedValues`, does not exist. Let's extend our behavior to add support for it.

```csharp
public class ListBoxSelectionBehavior<T> : Behavior<ListBox>
{
    public static readonly DependencyProperty SelectedItemsProperty =
        DependencyProperty.Register(
            nameof(SelectedItems),
            typeof(IList),
            typeof(ListBoxSelectionBehavior),
            new FrameworkPropertyMetadata(
                null,
                FrameworkPropertyMetadataOptions.BindsTwoWayByDefault,
                OnSelectedItemsChanged
            )
        );

    public static readonly DependencyProperty SelectedValuesProperty =
        DependencyProperty.Register(
            nameof(SelectedValues),
            typeof(IList),
            typeof(ListBoxSelectionBehavior),
            new FrameworkPropertyMetadata(
                null,
                FrameworkPropertyMetadataOptions.BindsTwoWayByDefault,
                OnSelectedValuesChanged
            )
        );

    private static void OnSelectedItemsChanged(DependencyObject sender, DependencyPropertyChangedEventArgs args)
    {
        var behavior = (ListBoxSelectionBehavior) sender;
        if (behavior._modelHandled) return;

        if (behavior.AssociatedObject == null)
            return;

        behavior._modelHandled = true;
        behavior.SelectedItemsToValues();
        behavior.SelectItems();
        behavior._modelHandled = false;
    }

    private static void OnSelectedValuesChanged(DependencyObject sender, DependencyPropertyChangedEventArgs args)
    {
        var behavior = (ListBoxSelectionBehavior) sender;
        if (behavior._modelHandled) return;

        if (behavior.AssociatedObject == null)
            return;

        behavior._modelHandled = true;
        behavior.SelectedValuesToItems();
        behavior.SelectItems();
        behavior._modelHandled = false;
    }

    private static object GetDeepPropertyValue(object obj, string path)
    {
        if (string.IsNullOrWhiteSpace(path)) return obj;
        while (true)
        {
            if (path.Contains('.'))
            {
                string[] split = path.Split('.');
                string remainingProperty = path.Substring(path.IndexOf('.') + 1);
                obj = obj.GetType().GetProperty(split[0]).GetValue(obj, null);
                path = remainingProperty;
                continue;
            }
            return obj.GetType().GetProperty(path).GetValue(obj, null);
        }
    }

    private bool _viewHandled;
    private bool _modelHandled;

    public IList SelectedItems
    {
        get => (IList) GetValue(SelectedItemsProperty);
        set => SetValue(SelectedItemsProperty, value);
    }

    public IList SelectedValues
    {
        get => (IList) GetValue(SelectedValuesProperty);
        set => SetValue(SelectedValuesProperty, value);
    }

    // Propagate selected items from model to view
    private void SelectItems()
    {
        _viewHandled = true;
        AssociatedObject.SelectedItems.Clear();
        if (SelectedItems != null)
        {
            foreach (var item in SelectedItems)
                AssociatedObject.SelectedItems.Add(item);
        }
        _viewHandled = false;
    }

    // Update SelectedItems based on SelectedValues
    private void SelectedValuesToItems()
    {
        if (SelectedValues == null)
        {
            SelectedItems = null;
        }
        else
        {
            SelectedItems =
                AssociatedObject.Items.Cast<T>()
                    .Where(i => SelectedValues.Contains(GetDeepPropertyValue(i, AssociatedObject.SelectedValuePath)))
                    .ToArray();
        }
    }

    // Update SelectedValues based on SelectedItems
    private void SelectedItemsToValues()
    {
        if (SelectedItems == null)
        {
            SelectedValues = null;
        }
        else
        {
            SelectedValues =
                SelectedItems.Cast<T>()
                    .Select(i => GetDeepPropertyValue(i, AssociatedObject.SelectedValuePath))
                    .ToArray();
        }
    }

    // Propagate selected items from view to model
    private void OnListBoxSelectionChanged(object sender, SelectionChangedEventArgs args)
    {
        if (_viewHandled) return;
        if (AssociatedObject.Items.SourceCollection == null) return;

        SelectedItems = AssociatedObject.SelectedItems.Cast<object>().ToArray();
    }

    // Re-select items when the set of items changes
    private void OnListBoxItemsChanged(object sender, NotifyCollectionChangedEventArgs args)
    {
        if (_viewHandled) return;
        if (AssociatedObject.Items.SourceCollection == null) return;

        SelectItems();
    }

    protected override void OnAttached()
    {
        base.OnAttached();

        AssociatedObject.SelectionChanged += OnListBoxSelectionChanged;
        ((INotifyCollectionChanged) AssociatedObject.Items).CollectionChanged += OnListBoxItemsChanged;

        _modelHandled = true;
        SelectedValuesToItems();
        SelectItems();
        _modelHandled = false;
    }

    /// <inheritdoc />
    protected override void OnDetaching()
    {
        base.OnDetaching();

        if (AssociatedObject != null)
        {
            AssociatedObject.SelectionChanged -= OnListBoxSelectionChanged;
            ((INotifyCollectionChanged) AssociatedObject.Items).CollectionChanged -= OnListBoxItemsChanged;
        }
    }
}
```

I added another dependency property for `SelectedValues` and a few new methods.

`SelectedValuesToItems()` and `SelectedItemsToValues()` convert between `SelectedItems` and `SelectedValues`, depending on which property was updated. `GetDeepPropertyValue(...)` is used to extract the value of the property using an object and a member path, to establish conformity between selected items and their values.

## Usage with SelectedValuePath

Now we can specify `SelectedValuePath` in `ListBox` and our behavior will allow us to bind the `SelectedValues` property to the model and vice versa.

```xml
<ListBox ItemsSource="{Binding Items}" SelectedValuePath="ID" SelectionMode="Multiple">
    <i:Interaction.Behaviors>
        <behaviors:MyObjectListBoxSelectionBehavior SelectedValues="{Binding SelectedValues}" />
    </i:Interaction.Behaviors>
    <ListBox.ItemTemplate>
        <!-- ... -->
    </ListBox.ItemTemplate>
</ListBox>
```
