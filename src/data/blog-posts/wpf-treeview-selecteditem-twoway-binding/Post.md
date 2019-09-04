---
title: WPF TreeView SelectedItem TwoWay binding
date: 2016-10-30
---

The longer I work with WPF, the more I notice how many things it's missing. Recently I realized that `TreeView.SelectedItem` property is read-only and non-bindable. I think there's no point explaining why binding `SelectedItem` would be useful, so there should be no surprise in my disappointment.

I googled the problem and every resource I've found was guiding me into either handling it in code-behind or adding `IsSelected` property to my model class. Both of these approaches suffer from a common important issue -- the item wouldn't get selected if its parents are not expanded. This was a deal-breaker for me because I wanted the treeview to navigate to the newly selected item, even if it wasn't immediately visible.

## Solution

I realized that to solve this I would have to traverse the entire hierarchy, but there was another problem I've encountered -- to access `IsSelected` and `IsExpanded` properties I needed to resolve reference to an instance of `TreeViewItem` -- a container that wraps around the data template. This in itself can be accomplished by using the `TreeViewItem.ItemContainerGenerator.ContainerFromItem(…)` method, however if the node is not visible the container is also not initialized, making the method return `null`. I solved this by looking for the parent nodes of the item I needed to select and expanding them one by one. However, even after the node is expanded, the dispatcher still needs to process it, which is why I resorted to handling the `Loaded` event of the `TreeViewItem` to know when it's safe to continue.

To determine if a a node is a child of another node I defined a delegate signature for users to implement -- `IsChildOfPredicate`.

### Behavior implementation

To make the solution re-usable, I implemented it as an interaction behavior.

```csharp
public class TreeViewSelectionBehavior : Behavior<TreeView>
{
    public delegate bool IsChildOfPredicate(object nodeA, object nodeB);

    public static readonly DependencyProperty SelectedItemProperty =
        DependencyProperty.Register(nameof(SelectedItem), typeof(object),
            typeof(TreeViewSelectionBehavior),
            new FrameworkPropertyMetadata(null, FrameworkPropertyMetadataOptions.BindsTwoWayByDefault,
                OnSelectedItemChanged));

    public static readonly DependencyProperty HierarchyPredicateProperty =
        DependencyProperty.Register(nameof(HierarchyPredicate), typeof(IsChildOfPredicate),
            typeof(TreeViewSelectionBehavior),
            new FrameworkPropertyMetadata(null));

    public static readonly DependencyProperty ExpandSelectedProperty =
        DependencyProperty.Register(nameof(ExpandSelected), typeof(bool),
            typeof(TreeViewSelectionBehavior),
            new FrameworkPropertyMetadata(false));

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
            new RoutedEventHandler(OnTreeViewItemLoaded));
    }

    // Update state of all items starting with given, with optional recursion
    private void UpdateTreeViewItem(TreeViewItem item, bool recurse)
    {
        if (SelectedItem == null) return;
        var model = item.DataContext;

        // If the selected item is this model and is not yet selected - select and return
        if (SelectedItem == model && !item.IsSelected)
        {
            item.IsSelected = true;
            if (ExpandSelected)
                item.IsExpanded = true;
        }
        // If the selected item is a parent of this model - expand
        else
        {
            bool isParentOfModel = HierarchyPredicate?.Invoke(SelectedItem, model) ?? true;
            if (isParentOfModel)
                item.IsExpanded = true;
        }

        // Recurse into children
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
            AssociatedObject.ItemContainerStyle = new Style(
                typeof(TreeViewItem),
                Application.Current.TryFindResource(typeof(TreeViewItem)) as Style);

        if (!AssociatedObject.ItemContainerStyle.Setters.Contains(_treeViewItemEventSetter))
            AssociatedObject.ItemContainerStyle.Setters.Add(_treeViewItemEventSetter);
    }

    private void OnTreeViewItemsChanged(object sender,
        NotifyCollectionChangedEventArgs args)
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

Once this behavior is attached, it calls `UpdateTreeViewItemStyle()` to inject an event handler for `Loaded` event of `ItemContainerStyle`. We need to listen to this event to handle nodes that just got expanded. To ensure maximum compatibility, it looks for a style if there is one already or creates a new one if there isn't.

It also calls `UpdateAllTreeViewItems()` straight away. This goes through all children of treeview and in turn calls `UpdateTreeViewItem(…)` on them.

The method `UpdateTreeViewItem(…)` itself works as follows:

- It checks if the given node's `DataContext` is equal to the selected model. If it is, it means we found the item we're looking for, so we can select it.
- If not, it checks if the `DataContext` is a parent of the selected model, using the `IsChildOfPredicate` delegate. If so, it expands it.
- If `recurse` is set, it also repeats the same process for all available children.

Because some of the nodes might not be expanded beforehand, we have to expand them and wait until `Loaded` event fires, which signifies us that the node is ready. Once the node is visible, we can call `UpdateTreeViewItem(…)` on it.

### Usage

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

When `SelectedItem` is changed from model, the behavior traverses the hierarchy while utilizing `HierarchyPredicate` to find the correct node, finally selecting it. An optional parameter `ExpandSelected` dictates whether the selected item should be expanded as well.

It's also worth noting that if `HierarchyPredicate` is not set, the behavior will still get the job done -- it will blindly open all available nodes until it finds the one it's looking for.
