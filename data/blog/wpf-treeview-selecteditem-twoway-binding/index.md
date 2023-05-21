---
title: 'WPF TreeView SelectedItem TwoWay Binding'
date: '2016-10-30'
---

The longer I work with WPF, the more I notice how many things it's missing. Recently I realized that `TreeView.SelectedItem` property is read-only and unbindable. I think there's no point explaining why binding `SelectedItem` would be useful, so there should be no surprise in my disappointment.

I googled the problem and every resource I've found was guiding me into either handling it in code-behind or adding an `IsSelected` property to my model class. Both of these approaches suffer from the same problem — an item won't get selected if its parents are not yet expanded. This was a deal-breaker for me because I wanted the tree view to navigate to the newly selected item, even if it wasn't immediately visible.

I solved this problem by writing a small behavior that takes care of this for me.

## Custom behavior

I realized that to solve this I would have to traverse the entire hierarchy of tree nodes, but that wasn't the only problem. To access the `IsSelected` and `IsExpanded` properties I needed to resolve a reference to an instance of `TreeViewItem`, which is a container that wraps around the data template.

This in itself can be accomplished by using the `TreeViewItem.ItemContainerGenerator.ContainerFromItem(...)` method. However, if the node is not visible yet, then the container is also not initialized, making the method return `null`.

In order to make our target node visible, we need to expand all of its ancestor nodes one by one, starting from the very top. I naively assumed that by expanding the node from code, its children's item containers will immediately become available, but this is not the case because that's handled asynchronously. We can, however, subscribe to the `Loaded` event of each data item, which will trigger once the control has been loaded.

Generally, the approach looks like this:

- Subscribe to the `Loaded` event of all data items using a style
- When `SelectedItem` changes, go through all loaded tree nodes and try to locate the target node
- If we manage to find it, select it and exit early
- If we instead find its parent, expand it so that we can continue the search once it's loaded
- When one of the nodes we expanded is loaded, it triggers an event, and we start again from the top

Here's the behavior I've implemented:

```csharp
public class TreeViewSelectionBehavior : Behavior<TreeView>
{
    public delegate bool IsChildOfPredicate(object nodeA, object nodeB);

    public static readonly DependencyProperty SelectedItemProperty =
        DependencyProperty.Register(
            nameof(SelectedItem),
            typeof(object),
            typeof(TreeViewSelectionBehavior),
            new FrameworkPropertyMetadata(
                null,
                FrameworkPropertyMetadataOptions.BindsTwoWayByDefault,
                OnSelectedItemChanged
            )
        );

    public static readonly DependencyProperty HierarchyPredicateProperty =
        DependencyProperty.Register(
            nameof(HierarchyPredicate),
            typeof(IsChildOfPredicate),
            typeof(TreeViewSelectionBehavior),
            new FrameworkPropertyMetadata(null)
        );

    public static readonly DependencyProperty ExpandSelectedProperty =
        DependencyProperty.Register(
            nameof(ExpandSelected),
            typeof(bool),
            typeof(TreeViewSelectionBehavior),
            new FrameworkPropertyMetadata(false)
        );

    private static void OnSelectedItemChanged(DependencyObject sender, DependencyPropertyChangedEventArgs args)
    {
        var behavior = (TreeViewSelectionBehavior) sender;
        if (behavior._modelHandled) return;

        if (behavior.AssociatedObject == null)
            return;

        behavior._modelHandled = true;
        behavior.UpdateAllTreeViewItems();
        behavior._modelHandled = false;
    }

    private readonly EventSetter _treeViewItemEventSetter;
    private bool _modelHandled;

    // Bindable selected item
    public object SelectedItem
    {
        get => GetValue(SelectedItemProperty);
        set => SetValue(SelectedItemProperty, value);
    }

    // Predicate that checks if two items are hierarchically related
    public IsChildOfPredicate HierarchyPredicate
    {
        get => (IsChildOfPredicate) GetValue(HierarchyPredicateProperty);
        set => SetValue(HierarchyPredicateProperty, value);
    }

    // Should expand selected?
    public bool ExpandSelected
    {
        get => (bool) GetValue(ExpandSelectedProperty);
        set => SetValue(ExpandSelectedProperty, value);
    }

    public TreeViewSelectionBehavior()
    {
        _treeViewItemEventSetter = new EventSetter(
            FrameworkElement.LoadedEvent,
            new RoutedEventHandler(OnTreeViewItemLoaded)
        );
    }

    // Update state of all items starting with given, with optional recursion
    private void UpdateTreeViewItem(TreeViewItem item, bool recurse)
    {
        if (SelectedItem == null)
            return;

        var model = item.DataContext;

        // If we find the item we're looking for - select it
        if (SelectedItem == model && !item.IsSelected)
        {
            item.IsSelected = true;
            if (ExpandSelected)
                item.IsExpanded = true;
        }
        // If we find the item's parent instead - expand it
        else
        {
            // If HierarchyPredicate is not set, this will always be true
            bool isParentOfModel = HierarchyPredicate?.Invoke(SelectedItem, model) ?? true;
            if (isParentOfModel)
                item.IsExpanded = true;
        }

        // Recurse into children in case some of them are already loaded
        if (recurse)
        {
            foreach (var subitem in item.Items)
            {
                var tvi = item.ItemContainerGenerator.ContainerFromItem(subitem) as TreeViewItem;
                if (tvi != null)
                    UpdateTreeViewItem(tvi, true);
            }
        }
    }

    // Update state of all items
    private void UpdateAllTreeViewItems()
    {
        var treeView = AssociatedObject;
        foreach (var item in treeView.Items)
        {
            var tvi = treeView.ItemContainerGenerator.ContainerFromItem(item) as TreeViewItem;
            if (tvi != null)
                UpdateTreeViewItem(tvi, true);
        }
    }

    // Inject Loaded event handler into ItemContainerStyle
    private void UpdateTreeViewItemStyle()
    {
        if (AssociatedObject.ItemContainerStyle == null)
        {
            var style = new Style(typeof(TreeViewItem),
                Application.Current.TryFindResource(typeof(TreeViewItem)) as Style);

            AssociatedObject.ItemContainerStyle = style;
        }

        if (!AssociatedObject.ItemContainerStyle.Setters.Contains(_treeViewItemEventSetter))
            AssociatedObject.ItemContainerStyle.Setters.Add(_treeViewItemEventSetter);
    }

    private void OnTreeViewItemsChanged(object sender, NotifyCollectionChangedEventArgs args)
    {
        UpdateAllTreeViewItems();
    }

    private void OnTreeViewSelectedItemChanged(object sender, RoutedPropertyChangedEventArgs<object> args)
    {
        if (_modelHandled) return;
        if (AssociatedObject.Items.SourceCollection == null) return;

        SelectedItem = args.NewValue;
    }

    private void OnTreeViewItemLoaded(object sender, RoutedEventArgs args)
    {
        UpdateTreeViewItem((TreeViewItem) sender, false);
    }

    protected override void OnAttached()
    {
        base.OnAttached();

        AssociatedObject.SelectedItemChanged += OnTreeViewSelectedItemChanged;
        ((INotifyCollectionChanged) AssociatedObject.Items).CollectionChanged += OnTreeViewItemsChanged;

        UpdateTreeViewItemStyle();
        _modelHandled = true;
        UpdateAllTreeViewItems();
        _modelHandled = false;
    }

    protected override void OnDetaching()
    {
        base.OnDetaching();

        if (AssociatedObject != null)
        {
            AssociatedObject.ItemContainerStyle?.Setters?.Remove(_treeViewItemEventSetter);
            AssociatedObject.SelectedItemChanged -= OnTreeViewSelectedItemChanged;
            ((INotifyCollectionChanged) AssociatedObject.Items).CollectionChanged -= OnTreeViewItemsChanged;
        }
    }
}
```

To make it easier to check if a node is a child of another node, I defined a property called `HierarchyPredicate`. If it's not set, the behavior will just blindly expand all nodes until it finds the item we're looking for. The predicate can help optimize this process.

Once this behavior is attached, it calls `UpdateTreeViewItemStyle()` to inject a handler for the `Loaded` event inside `ItemContainerStyle`. We need to listen to this event to handle nodes that were expanded. To ensure maximum compatibility, it extends an existing style if it can find one or creates a new one otherwise.

It also calls `UpdateAllTreeViewItems()` after attaching. This goes through all of the tree view's children and in turn calls `UpdateTreeViewItem(...)` on them.

## Usage

You can attach this behavior to a tree view like this:

```xml
<TreeView ItemsSource="{Binding Items}">
    <i:Interaction.Behaviors>
        <behaviors:TreeViewSelectionBehavior ExpandSelected="True"
                                             HierarchyPredicate="{Binding HierarchyPredicate}"
                                             SelectedItem="{Binding SelectedItem}" />
    </i:Interaction.Behaviors>
    <TreeView.ItemTemplate>
        <!-- ... -->
    </TreeView.ItemTemplate>
</TreeView>
```

When `SelectedItem` is changed from the view model, the behavior traverses the hierarchy while utilizing `HierarchyPredicate` to find the correct node, ultimately selecting it. An optional `ExpandSelected` parameter dictates whether the selected item should be expanded as well.

If the user changes `SelectedItem` from the UI, it works like you would expect and propagates the new value to the view model.
