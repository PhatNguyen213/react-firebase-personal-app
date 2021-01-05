import { ButtonGroup, Button } from '@progress/kendo-react-buttons';
import { DateRangePicker } from '@progress/kendo-react-dateinputs';

import { useLocalization } from '@progress/kendo-react-intl';
import { filterBy } from '@progress/kendo-data-query';

import { Grid, Column, ColumnMenu } from '../common/Grid';
import Chart from '../common/Chart';
import {
  FullNameCell,
  FlagCell,
  OnlineCell,
  RatingCell,
  EngagementCell,
  CurrencyCell,
} from '../common/GridCells';

import AppContext from '../../contexts/AppContext';

import employees from '../../assets/json/employees';
import teams from '../../assets/json/teams';
import orders from '../../assets/json/orders';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

const Dashboard = () => {
  const [data, setData] = useState(employees);
  const [isTrend, setIsTrend] = useState(true);
  const [isMyTeam, setIsMyTeam] = useState(true);
  const localizationService = useLocalization();

  const isChartChangeRef = useRef(false);
  const onChartRefresh = useCallback(() => null, []);

  useEffect(() => {
    isChartChangeRef.current = false;
  });

  const { teamId } = useContext(AppContext);
  const gridFilterExpression = isMyTeam
    ? {
      logic: 'and',
      filters: [{ field: 'teamId', operator: 'eq', value: teamId }],
    }
    : null;

  const [range, setRange] = useState({
    start: new Date('2020-01-01T21:00:00.000Z'),
    end: new Date('2020-04-29T21:00:00.000Z'),
  });
  const onRangeChange = useCallback(
    event => {
      setRange({
        start: event.value.start,
        end: event.value.end,
      });
    },
    [setRange]
  );
  const trendOnClick = useCallback(() => {
    isChartChangeRef.current = true;
    setIsTrend(true);
  }, [setIsTrend]);
  const volumeOnClick = useCallback(() => {
    isChartChangeRef.current = true;
    setIsTrend(false);
  }, [setIsTrend]);
  const myTeamOnClick = useCallback(() => setIsMyTeam(true), [setIsMyTeam]);
  const allTeamOnClick = useCallback(() => setIsMyTeam(false), [setIsMyTeam]);
  /*eslint-disable */
  return (
    <div id="Dashboard" className="dashboard-page main-content">
      <div className="card-container grid">
        <h3 className="card-title">
          {localizationService.toLanguageString('custom.teamEfficiency')}
        </h3>
        <div className="card-buttons">
          <ButtonGroup>
            <Button togglable selected={isTrend} onClick={trendOnClick}>
              {localizationService.toLanguageString('custom.trend')}
            </Button>
            <Button togglable selected={!isTrend} onClick={volumeOnClick}>
              {localizationService.toLanguageString('custom.volume')}
            </Button>
          </ButtonGroup>
        </div>
        <div className="card-ranges">
          <DateRangePicker value={range} onChange={onRangeChange} />
        </div>
        <div className="card-component">
          <Chart
            data={orders}
            filterStart={range.start}
            filterEnd={range.end}
            groupByField="teamID"
            groupResourceData={teams}
            groupTextField="teamName"
            groupColorField="teamColor"
            seriesCategoryField="orderDate"
            seriesField="orderTotal"
            seriesType={isTrend ? 'line' : 'column'}
            onRefresh={isChartChangeRef.current ? null : onChartRefresh}
          />
        </div>
      </div>
      <div className="card-container grid">
        <h3 className="card-title">
          {localizationService.toLanguageString('custom.teamMembers')}
        </h3>
        <div className="card-buttons">
          <ButtonGroup>
            <Button togglable selected={isMyTeam} onClick={myTeamOnClick}>
              {localizationService.toLanguageString('custom.myTeam')}
            </Button>
            <Button togglable selected={!isMyTeam} onClick={allTeamOnClick}>
              {localizationService.toLanguageString('custom.allTeams')}
            </Button>
          </ButtonGroup>
        </div>
        <span />
        <div className="card-component">
          <Grid
            data={filterBy(data, gridFilterExpression)}
            style={{ height: 450 }}
            onDataChange={data => setData(data)}
          >
            <Column
              title={localizationService.toLanguageString('custom.employee')}
              groupable={false}
            >
              <Column
                field="fullName"
                title={localizationService.toLanguageString(
                  'custom.contactName'
                )}
                columnMenu={ColumnMenu}
                width={230}
                cell={FullNameCell}
              />
              <Column
                field="jobTitle"
                title={localizationService.toLanguageString('custom.jobTitle')}
                columnMenu={ColumnMenu}
                width={230}
              />
              <Column
                field="country"
                title={localizationService.toLanguageString('custom.country')}
                columnMenu={ColumnMenu}
                width={100}
                cell={FlagCell}
              />
              <Column
                field="isOnline"
                title={localizationService.toLanguageString('custom.status')}
                columnMenu={ColumnMenu}
                width={100}
                cell={OnlineCell}
                filter="boolean"
              />
            </Column>
            <Column
              title={localizationService.toLanguageString('custom.performance')}
              groupable={false}
            >
              <Column
                field="rating"
                title={localizationService.toLanguageString('custom.rating')}
                columnMenu={ColumnMenu}
                width={110}
                cell={RatingCell}
                filter="numeric"
              />
              <Column
                field="target"
                title={localizationService.toLanguageString(
                  'custom.engagement'
                )}
                columnMenu={ColumnMenu}
                width={200}
                cell={EngagementCell}
                filter="numeric"
              />
              <Column
                field="budget"
                title={localizationService.toLanguageString('custom.budget')}
                columnMenu={ColumnMenu}
                width={100}
                cell={CurrencyCell}
                filter="numeric"
              />
            </Column>
            <Column
              title={localizationService.toLanguageString('custom.contacts')}
              groupable={false}
            >
              <Column
                field="phone"
                title={localizationService.toLanguageString('custom.phone')}
                columnMenu={ColumnMenu}
                width={130}
              />
              <Column
                field="address"
                title={localizationService.toLanguageString('custom.address')}
                columnMenu={ColumnMenu}
                width={200}
              />
            </Column>
          </Grid>
        </div>
      </div>
    </div>
  );
  /* eslint-enable */
};

export default Dashboard;
