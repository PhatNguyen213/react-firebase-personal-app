import * as PropTypes from 'prop-types';

import {
  Grid as KendoGrid,
  GridColumn,
  GridColumnMenuSort,
  GridColumnMenuFilter,
  GridToolbar,
} from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { GridPDFExport } from '@progress/kendo-react-pdf';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { process } from '@progress/kendo-data-query';
import { Input } from '@progress/kendo-react-inputs';
import { useLocalization } from '@progress/kendo-react-intl';
import { useRef, useState, useCallback, useEffect } from 'react';

export const Column = GridColumn;

export const ColumnMenu = props => (
  <div>
    <GridColumnMenuSort {...props} />
    <GridColumnMenuFilter {...props} />
  </div>
);

export const Grid = props => {
  const { data, onDataChange, children, ...others } = props;

  const excelExportRef = useRef(null);
  const pdfExportRef = useRef(null);

  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [take, setTake] = useState(10);
  const [skip, setSkip] = useState(0);
  const [sort, setSort] = useState([]);
  const [group, setGroup] = useState([]);
  const [filter, setFilter] = useState(null);
  const lastSelectedIndexRef = useRef(0);
  const [allColumnFilter, setAllColumnFilter] = useState('');
  const localizationService = useLocalization();

  const dataState = {
    take,
    skip,
    sort,
    group,
    filter,
  };

  const onDataStateChange = useCallback(
    event => {
      setTake(event.data.take);
      setSkip(event.data.skip);
      setSort(event.data.sort);
      setGroup(event.data.group);
      setFilter(event.data.filter);
    },
    [setTake, setSkip, setSort, setGroup]
  );

  const onExcelExport = useCallback(() => {
    if (excelExportRef.current) {
      excelExportRef.current.save();
    }
  }, []);

  const onPdfExportDone = useCallback(() => {
    setIsPdfExporting(false);
  }, []);

  const onAllColumnFilterChange = useCallback(
    event => {
      setAllColumnFilter(event.value);
    },
    [setAllColumnFilter]
  );

  const onSelectionChange = useCallback(
    event => {
      let last = lastSelectedIndexRef.current;
      const updatedData = data.map(dataItem => ({ ...dataItem }));
      const current = data.findIndex(dataItem => dataItem === event.dataItem);

      if (!event.nativeEvent.shiftKey) {
        last = current;
        lastSelectedIndexRef.current = last;
      }

      if (!event.nativeEvent.ctrlKey) {
        /*eslint-disable */
        updatedData.forEach(item => (item.selected = false));
        /* eslint-enable */
      }
      const select = !event.dataItem.selected;
      for (
        let i = Math.min(last, current);
        i <= Math.max(last, current);
        i += 1
      ) {
        updatedData[i].selected = select;
      }

      onDataChange(updatedData);
    },
    [data, onDataChange]
  );

  const onHeaderSelectionChange = useCallback(
    event => {
      const { checked } = event.syntheticEvent.target;
      const updatedData = data.map(item => ({
        ...item,
        selected: checked,
      }));

      onDataChange(updatedData);
    },
    [data, onDataChange]
  );

  /*eslint-disable */
  const textColumns = children
    .map(col => {
      if (col.props.children) {
        return col.props.children.map(child => {
          if (!child.props.filter || child.props.filter === 'text') {
            return child.props.field;
          }
        });
      }
      if (col.props.field) {
        if (!col.props.filter || col.props.filter === 'text') {
          return col.props.field;
        }
      }
    })
    .flat()
    .filter(field => field);
    /* eslint-enable */

  const allColumnsFilters = textColumns.map(column => ({
    field: column,
    operator: 'contains',
    value: allColumnFilter,
  }));

  const allColumnFilteredData = allColumnFilter
    ? process(data, { filter: { logic: 'or', filters: allColumnsFilters } })
      .data
    : data;

  const processedData = process(allColumnFilteredData, dataState);

  useEffect(() => {
    if (!processedData.data.length) {
      setSkip(0);
    }
  }, [processedData]);

  const onPdfExport = useCallback(() => {
    if (pdfExportRef.current) {
      setIsPdfExporting(true);
      pdfExportRef.current.save(processedData.data, onPdfExportDone);
    }
  }, [processedData, onPdfExportDone]);

  const GridElement = (
    <KendoGrid
      {...dataState}
      {...others}
      rowHeight={40}
      pageable
      sortable
      groupable
      selectedField="selected"
      data={processedData}
      onDataStateChange={onDataStateChange}
      onSelectionChange={onSelectionChange}
      onHeaderSelectionChange={onHeaderSelectionChange}
    >
      <GridToolbar>
        <Input
          value={allColumnFilter}
          onChange={onAllColumnFilterChange}
          placeholder={localizationService.toLanguageString(
            'custom.gridSearch'
          )}
        />
        <Button icon="excel" onClick={onExcelExport}>
          {localizationService.toLanguageString('custom.exportExcel')}
        </Button>
        <Button icon="pdf" onClick={onPdfExport} disabled={isPdfExporting}>
          {localizationService.toLanguageString('custom.exportPdf')}
        </Button>
      </GridToolbar>
      <Column
        field="selected"
        width={50}
        title={' '}
        headerSelectionValue={
          data.findIndex(dataItem => dataItem.selected === false) === -1
        }
      />
      {children}
    </KendoGrid>
  );

  return (
    <>
      <ExcelExport data={data} ref={excelExportRef}>
        {GridElement}
      </ExcelExport>
      <GridPDFExport ref={pdfExportRef}>{GridElement}</GridPDFExport>
    </>
  );
};
Grid.displayName = 'Grid';
Grid.propTypes = {
  data: PropTypes.array,
  onDataChange: PropTypes.func,
  style: PropTypes.object,
};
