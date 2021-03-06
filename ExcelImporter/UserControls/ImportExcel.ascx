﻿<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="ImportExcel.ascx.cs" Inherits="ExcelImporter.UserControls.ExcelImporter" EnableViewState="false" %>

<div id="importExcel">
    <div id="modalProgress" class="modal fade modal-progress" data-backdrop="static" data-keyboard="false">
        <div class="text-center ajax-loader">
        </div>
    </div>
    <div id="alertPane" style="display: none">
        <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
    </div>
    <div id="alertDetails" class="modal fade">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h4>Error details</h4>
                </div>
                <div class="modal-body text-capitalize" style="max-height: 500px">
                    <pre class="pre-scrollable"></pre>
                </div>
            </div>
        </div>
    </div>
    <div class="page-header">
        <h2>Import data</h2>
    </div>
    <h3>Step 1. Select file</h3>
    <div class="well">
        Select an Excel file that will be imported to the database. The data in the first sheet is included. A header row is required. Preview is shown before any data is saved.
    </div>
    <asp:HiddenField ID="FileId" runat="server" />
    <div id="fileUpload" class="form file-upload" role="form">
        <asp:Panel ID="fileForm" CssClass="form-group form-inline" runat="server">
            <a href="#" class="btn btn-primary selector" data-loading-text="Loading...">Select File</a>
            <asp:TextBox ID="SelectedFile" CssClass="form-control full-width" ReadOnly="true" runat="server" />
            <asp:FileUpload ID="FileUpload" CssClass="hidden" runat="server" />
            <asp:Panel ID="fileFormError" CssClass="help-block" Visible="false" runat="server"><strong>Invalid format or corrupted file</strong></asp:Panel>
        </asp:Panel>
        <asp:Button ID="UploadButton" Style="display: none" runat="server"></asp:Button>
    </div>
    <asp:Panel ID="MappingPanel" runat="server">
        <h3>Step 2. Map columns to database items</h3>
        <div class="well">
            Set which headers correspond to which tables and columns in the database. Columns marked with <strong>[key]</strong> are key columns which
            require unique values. A random value is used as a key if no key column is mapped. Header is omitted if no table and column is selected for it.
        </div>
        <asp:GridView ID="ColumnMappings" EnableTheming="false" CssClass="table small" AutoGenerateColumns="false" runat="server">
            <Columns>
                <asp:TemplateField>
                    <HeaderStyle Width="1" />
                    <HeaderTemplate>
                        Header
                    </HeaderTemplate>
                    <ItemTemplate>
                        <asp:Label ID="myHeaderLabel" Text='<%# Eval("ImportColumn") %>' runat="server"></asp:Label>
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField>
                    <HeaderTemplate>
                        Table
                    </HeaderTemplate>
                    <ItemTemplate>
                        <asp:DropDownList ID="myDropDownListTables" DataSource='<%# Eval("Tables") %>' DataValueField="FullName" DataTextField="Name"
                            CssClass="form-control input-sm" AppendDataBoundItems="true" runat="server">
                            <asp:ListItem Text="" Value=""></asp:ListItem>
                        </asp:DropDownList>
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField>
                    <HeaderTemplate>
                        Column
                    </HeaderTemplate>
                    <ItemTemplate>
                        <asp:DropDownList ID="myDropDownListColumns" DataSource='<%# Eval("Columns") %>' DataValueField="Name" DataTextField="Text"
                            CssClass="form-control input-sm" AppendDataBoundItems="true" runat="server">
                            <asp:ListItem Text="" Value=""></asp:ListItem>
                        </asp:DropDownList>
                    </ItemTemplate>
                </asp:TemplateField>
            </Columns>
        </asp:GridView>
        <button id="startPreviewButton" type="button" class="btn btn-primary" data-loading-text="Processing...">Preview</button>
    </asp:Panel>
    <div id="previewPanel" style="display: none">
        <h3>Step 3. Review changes</h3>
        <div class="well">
            Review changes and press save to commit changes to database. Select ignore to reject all the changes.
        </div>
        <div id="previewChanges">
        </div>
        <button id="commitChanges" type="button" class="btn btn-primary" data-loading-text="Saving...">Save</button>
        <button id="confirmIgnoreChanges" type="button" data-toggle="popover" data-html="true" data-title="Are you sure?" data-popover-content="#ignoreChangesPopover"
            data-trigger="focus" data-placement="top" class="btn btn-default">
            Ignore</button>
        <div id="ignoreChangesPopover" style="display: none">
            <button id="ignoreChanges" type="button" data-dismiss="popover" class="btn btn-danger">Yes</button>
            <button type="button" class="btn btn-default">No</button>
        </div>
        <div id="previewItems" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title"></h4>
                    </div>
                    <div class="modal-body scrollbars" style="max-height: 500px">
                        <table class="table small">
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
    $(function () {
        ImportExcelController.init('#importExcel');
    });
</script>
