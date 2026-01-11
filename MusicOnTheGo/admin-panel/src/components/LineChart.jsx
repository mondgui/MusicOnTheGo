import { ResponsiveLine } from '@nivo/line';
import { tokens } from '../theme';

const LineChart = ({ data, dataPointCount = 30 }) => {
  const colors = tokens;
  
  // Get the actual data points to determine which labels to show
  const dataPoints = data[0]?.data || [];
  
  // Calculate which specific labels to show based on data point count
  // This prevents overlap by only showing labels at specific intervals
  let tickValues = undefined;
  let labelInterval = 1;
  
  if (dataPointCount > 60) {
    // For 90 days: show every 15th label (about 6 labels total)
    labelInterval = Math.ceil(dataPointCount / 6);
    tickValues = dataPoints
      .filter((_, index) => index % labelInterval === 0 || index === dataPoints.length - 1)
      .map(point => point.x);
  } else if (dataPointCount > 25) {
    // For 30 days and 6 months (26 weeks): show every 5th-6th label (about 5-6 labels total)
    labelInterval = Math.ceil(dataPointCount / 5);
    tickValues = dataPoints
      .filter((_, index) => index % labelInterval === 0 || index === dataPoints.length - 1)
      .map(point => point.x);
  } else if (dataPointCount > 10) {
    // For 7-10 days: show every 3rd label
    labelInterval = Math.ceil(dataPointCount / 4);
    tickValues = dataPoints
      .filter((_, index) => index % labelInterval === 0 || index === dataPoints.length - 1)
      .map(point => point.x);
  }
  // For 10 or fewer, show all labels (tickValues = undefined)
  
  // Adjust bottom margin and rotation based on data density
  const bottomMargin = dataPointCount > 60 ? 140 : dataPointCount > 30 ? 120 : 90;
  const tickRotation = dataPointCount > 60 ? -70 : dataPointCount > 30 ? -60 : -45;

  return (
    <ResponsiveLine
      data={data}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[800],
            },
          },
          legend: {
            text: {
              fill: colors.grey[900],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[800],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[900],
              fontSize: dataPointCount > 60 ? 10 : 12,
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[900],
          },
        },
        tooltip: {
          container: {
            color: colors.grey[900],
            background: colors.grey[200],
          },
        },
      }}
      colors={{ scheme: 'nivo' }}
      margin={{ top: 50, right: 110, bottom: bottomMargin, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: 'bottom',
        tickSize: 5,
        tickPadding: 8,
        tickRotation: tickRotation,
        legend: 'Period',
        legendOffset: 50,
        legendPosition: 'middle',
        tickValues: tickValues, // Show only selected labels to prevent overlap
        format: (value) => {
          // Truncate long labels if needed
          if (value && value.length > 10) {
            return value.substring(0, 10) + '...';
          }
          return value;
        },
      }}
      axisLeft={{
        orient: 'left',
        tickValues: 5,
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Count',
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;

