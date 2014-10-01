﻿// import-excel-controller.js

importExcelController = function () {
    'use strict';

    var initialized = false;
    var previewData = null;
    var importExcelPage = null;
    var fileId = null;
    var fileUpload = null;
    var alertPanel = null;
    var alertDetails = null;
    var mappingPanel = null;
    var previewPanel = null;
    var previewDialog = null;
    var modalProgress = null;

    function clearAll() {
        $(importExcelPage).find('input').val('');
        mappingPanel.fadeOut();
        previewPanel.fadeOut();
    }

    function ajaxHelper(uri, method, data, trigger) {
        if ($(trigger).hasClass('btn')) {
            $(trigger).button('loading');
        }
        var timeoutId = _.delay(function () {
            modalProgress.modal('show');
        }, 100);
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null
        }).error(function (jqXHR, textStatus, errorThrown) {
            clearAll();
            var json = null;
            try {
                json = $.parseJSON(jqXHR.responseText);
            }
            catch (e) { }
            var errorText = parseWebApiError(json);
            if (!_.isEmpty(errorText)) {
                alertDetails.find('.modal-body pre').append(errorText);
            }
            alert('danger', 'Something went wrong. Error: ' + errorThrown + '.', !_.isEmpty(errorText));
        }).complete(function (jqXHR, textStatus) {
            clearTimeout(timeoutId);
            modalProgress.modal('hide');
            $(trigger).button('reset');
        });
    }

    function populateColumnSelectionDropDown(el) {
        var ddlColumns = el.parent().parent().find('[name$=myDropDownListColumns]');
        ddlColumns.find('option').remove();
        $('<option>').val('').html('').appendTo(ddlColumns); // empty selection

        if (!_.isEmpty(el.val())) {
            var uri = decodeURI('/api/columns/' + el.val());
            ajaxHelper(uri, 'GET', null).success(function (data) {
                $.each(data, function (i, item) {
                    var html = item.name;
                    if (item.key) {
                        html = '[key] ' + html;
                    }
                    $('<option>').val(item.name).html(html).appendTo(ddlColumns);
                });
            });
        }
    }

    function alert(status, text, details) {
        alertPanel.removeAttr('class').addClass('alert alert-' + status + ' fade in top-buffer').append(text);
        if (details) {
            var detailsLink = $('<a>').attr('href', '#').addClass('alert-link').text('Details');
            $(alertPanel).append(' ').append(detailsLink);
            $(alertPanel).find('.alert-link').click(function () {
                $(alertDetails).modal('show');
            });
        }
        alertPanel.show();
    }

    // parses a web api error object into text
    function parseWebApiError(jsonObj) {
        if (_.isUndefined(jsonObj)) {
            return '';
        }
        var ret = '';
        for (var key in jsonObj) {
            var val = jsonObj[key];
            if (_.isObject(val)) {
                ret += parseWebApiError(val);
            }
            else {
                ret += key + ': ' + val + '\n';
            }
        }

        return ret;
    }

    return {
        init: function (page) {

            if (initialized) {
                return;
            }

            importExcelPage = $(page);

            fileId = $(importExcelPage).find('[id$=FileId]').val();
            fileUpload = $(importExcelPage).find('#fileUpload');
            alertPanel = $(importExcelPage).find('#alertPane')
            alertDetails = $(importExcelPage).find('#alertDetails');
            mappingPanel = $(importExcelPage).find('[id$=MappingPanel]');
            previewPanel = $(importExcelPage).find('#previewPanel');
            previewDialog = $(importExcelPage).find('#previewItems .modal-dialog');
            modalProgress = $(importExcelPage).find('#modalProgress');

            if (_.isEmpty(fileId)) {
                clearAll();
            }
            else {
                mappingPanel.fadeIn();
                $(document).scrollTop(mappingPanel.offset().top);
            }

            fileUpload.find('.selector').click(function () {
                $(this).siblings('[type=file]').click();
            });

            fileUpload.find('[type=file]').change(function () {
                var self = $(this);
                if (_.isEmpty(self.val())) {
                    clearAll();
                    return;
                }
                self.siblings('.form-control').val(self.val().replace(/C:\\fakepath\\/i, ''));
                fileUpload.find('.selector').button('loading');
                modalProgress.modal('show');
                fileUpload.find('[id$=UploadButton]').click(); // post back triggered
            });

            previewDialog.parent().on('hide.bs.modal', function () {
                $(this).find('.modal-body').scrollTop(0);
            });

            mappingPanel.find('[name$=myDropDownListTables]').change(function () {
                populateColumnSelectionDropDown($(this));
            });

            $(importExcelPage).find('#startPreviewButton, #commitChanges').click(function () {
                var self = $(this);

                var isPreview = (this.id === 'startPreviewButton');
                var uri = decodeURI('/api/import/' + fileId + (isPreview ? '?preview=true' : ''));
                var postData = [];
                $(importExcelPage).find('[name$=myDropDownListTables]').each(function () {
                    var el = $(this);
                    if (_.isEmpty(el.val()))
                        return;
                    var label = el.parent().parent().find('[id*=HeaderLabel]');
                    var ddlColumns = el.parent().parent().find('[name$=myDropDownListColumns]');
                    var newItem = {
                        header: label.text(),
                        table: el.val(),
                        column: ddlColumns.val()
                    };
                    postData.push(newItem);
                });

                ajaxHelper(uri, 'POST', postData, self).success(function (data) {
                    previewData = data;
                    if (isPreview) {
                        var previewChanges = $(importExcelPage).find('#previewChanges');

                        previewChanges.html('');
                        $.each(data, function (i, item) {
                            var items = $('<li>').text('New items: ').
                                append($('<a>').attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#previewItems').
                                attr('data-table', item.name).attr('data-table-type', 'a').append($('<span>').addClass('badge').text(item.addedCount)));
                            $('<li>').text('Modified items: ').
                                append($('<a>').attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#previewItems').
                                attr('data-table', item.name).attr('data-table-type', 'm').append($('<span>').addClass('badge').text(item.modifiedCount))).
                                appendTo(items);
                            previewChanges.append(item.name).append($('<ul>').append(items));
                        });

                        previewChanges.find('a').click(function () {
                            var self = $(this);

                            var previewItems = $(importExcelPage).find('#previewItems');
                            var table = previewItems.find('.modal-body table');
                            table.html('');
                            var modalTitle = previewItems.find('.modal-title');
                            modalTitle.text('');

                            var tablePreviewData = _.where(previewData, { name: self.data('table') })[0];
                            var columns = tablePreviewData.columns;
                            var currentData = [];
                            var oldData = [];
                            if (self.data('table-type') === 'a') {
                                currentData = tablePreviewData.added;
                            } else if (self.data('table-type') === 'm') {
                                currentData = tablePreviewData.modified;
                                oldData = tablePreviewData.original;
                            }

                            modalTitle.text(self.data('table'));

                            var header = $('<thead>');
                            var headerRow = $('<tr>');

                            $.each(columns, function (i, column) {
                                $('<th>').text(column).appendTo(headerRow);
                            });
                            header.append(headerRow);
                            table.append(header);

                            var body = $('<tbody>');
                            $.each(currentData, function (i, object) {
                                var newRow = $('<tr>');
                                $.each(object, function (ii, value) {
                                    var modified = _.isUndefined(oldData) ? false : oldData[i][ii] !== value;
                                    $('<td>').text(value).addClass(modified ? 'bg-info' : '').appendTo(newRow);
                                });
                                body.append(newRow);
                            });
                            table.append(body);
                        });

                        var previewPanel = $('#previewPanel');
                        previewPanel.fadeIn();
                        $(document).scrollTop(previewPanel.offset().top);
                    }
                    else {
                        fileUpload.find('[type=file]').val('').change();
                        alert('success', 'Data imported succesfully.');
                    }
                });
            });

            previewPanel.find('#confirmIgnoreChanges').popover({
                content: function () {
                    return $($(this).data('popover-content')).html();
                }
            }).on('shown.bs.popover', function () {
                $(importExcelPage).find('button[id=ignoreChanges]').click(function () {
                    var uri = decodeURI('/api/import/' + fileId);
                    ajaxHelper(uri, 'DELETE', null, $(this)).success(function () {
                        fileUpload.find('[type=file]').val('').change();
                        alert('info', 'Import cancelled.');
                    });
                });
            });
        }
    };
}();
