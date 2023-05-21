---
title: 'Conditional Content Presenting via WPF ContentPresenter'
date: '2016-10-28'
---

Sometimes you may find yourself facing a problem of having to switch between multiple presentations based on some condition. For example, you may want to display the same list of items differently depending on whether multi-select is enabled or not.

The easiest and the most obvious way to achieve this is to bind the `Visibility` property of the elements so that one is shown while the other is collapsed or hidden. However, this approach comes at a cost.

## Downsides of switching visibility

Changing the value of the `Visibility` property tends to get the job done, but it has some noticeable drawbacks:

- You have to use a converter to turn the bound value into `Visibility`
- It gets complicated when there are more than two presentations to switch between or when there is more than one condition
- Even when collapsed or hidden, all the UI elements still remain in the visual tree

The last point is something that tends to get overlooked and may lead to problems. When you make an element invisible, be it by setting the `Visibility` to `Hidden` or `Collapsed`, it doesn't actually disappear from the visual tree. This means it still takes part in most interactions, including bindings. Additionally, if a hidden element has a binding that fails, an exception will be raised and silently suppressed by the framework, potentially causing performance issues.

## Using ContentPresenter

To address this problem more efficiently you can use `ContentPresenter` instead. This control can switch its content using predefined triggers and data templates.

Here's an example of how a typical setup may look like using `ContentPresenter`:

```xml
<ContentPresenter Content="{Binding}">

    <!-- Presentations -->
    <ContentPresenter.Resources>
        <DataTemplate x:Key="ComboBoxPresenter">
            <ComboBox ItemsSource="{Binding Items}" IsReadOnly="True" />
        </DataTemplate>
        <DataTemplate x:Key="ListBoxPresenter">
            <ListBox ItemsSource="{Binding Items}" SelectionMode="Multiple" />
        </DataTemplate>
    </ContentPresenter.Resources>

    <!-- Triggers -->
    <ContentPresenter.Style>
        <Style TargetType="{x:Type ContentPresenter}">
            <Style.Triggers>
                <DataTrigger Binding="{Binding IsMultiselect}" Value="False">
                    <Setter Property="ContentTemplate" Value="{StaticResource ComboBoxPresenter}" />
                </DataTrigger>
                <DataTrigger Binding="{Binding IsMultiselect}" Value="True">
                    <Setter Property="ContentTemplate" Value="{StaticResource ListBoxPresenter}" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </ContentPresenter.Style>

</ContentPresenter>
```

Here we bind the `Content` property to the current `DataContext` so that it can be accessed by the data templates.

The `ContentPresenter.Resources` lists data templates used for each separate presentation — in this case it's a combobox and a listbox bound to the same collection. To configure which data template is used when, we declare a set of triggers that check the value of the `IsMultiselect` property and switch the `ContentTemplate` accordingly.

Note how using triggers gives us more flexibility — we don't need to use converters in order to turn `IsMultiselect` into an instance of `Visibility`, we just bind to it directly.

Using this approach, we're also not leaving any unnecessary mess in the visual tree because we're changing the actual content instead of just hiding it.
