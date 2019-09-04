---
title: Conditional content presenting via WPF ContentPresenter
date: 2016-10-28
---

Sometimes you may find yourself facing a problem of having to switch between multiple presentations based on some condition -- for example, showing a listbox instead of a combobox when multiselect is enabled. The easiest and the most obvious solution is to change the `Visibility` property of the elements so that one is shown while the other one is collapsed or hidden.

## Downsides of switching Visibility

Changing the value of `Visibility` property on respective controls tends to get the job done most of the time, but has some noticeable drawbacks:

- Have to use bool-to-visibility and invert-bool-to-visibility converters.
- Gets complicated when there are more than two presentations to switch between.
- All the elements still remain in the visual tree even when collapsed or hidden.

The last point is also something that tends to get overlooked and may cause several issues. When you make an element invisible, be it by setting the `Visibility` to `Hidden` or `Collapsed`, it doesn't actually disappear from the visual tree. As such, it still takes part in most interactions, including bindings. If a hidden element has a binding that fails, exceptions will be raised and silently suppressed by the framework, causing potential performance issues.

## Use ContentPresenter as an alternative

To solve this problem more efficiently, you can use `ContentPresenter` instead. This element can switch its content using data templates, triggers and/or code-behind and doesn't suffer from any drawbacks of the former method.

### Configuration

Use `ContentPresenter` in places where you need to alternate between two or more presentations. Make use of data templates and data triggers to define which viewmodel state will correspond to which presentation.

```xml
<ContentPresenter Content="{Binding}">
    <ContentPresenter.Resources>
        <DataTemplate x:Key="ComboBoxPresenter">
            <ComboBox ItemsSource="{Binding Options}" IsReadOnly="True" />
        </DataTemplate>
        <DataTemplate x:Key="ListBoxPresenter">
           <ListBox ItemsSource="{Binding Options}" SelectionMode="Multiple" />
        </DataTemplate>
    </ContentPresenter.Resources>

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

We bind the `ContentPresenter.Content` property to the current `DataContext` so that it can be accessed by the data templates. In this content presenter, each data template represents one of the optional presentations -- in our case it's a combobox and a listbox. The data triggers defined in `ContentPresenter.Style` are responsible for choosing which presentation is the active one using a set of bindings and conditions.

### Usage

With this setup, the user will see a combobox on their screen when `IsMultiselect` property evaluates to `false`, and a listbox when it evaluates to `true`.

If you have a more complicated situation where using data triggers to select data templates is either cumbersome or ineffective, you can use `ContentTemplateSelector` instead. It's a delegate that you can define to specify custom logic for locating appropriate data template.
