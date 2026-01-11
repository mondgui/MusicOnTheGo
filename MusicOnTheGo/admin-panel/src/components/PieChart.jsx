import { ResponsivePie } from '@nivo/pie';
import { tokens } from '../theme';

const PieChart = ({ data }) => {
  const colors = tokens;

  return (
    <ResponsivePie
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
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[900],
          },
        },
      }}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.4}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{
        from: 'color',
        modifiers: [['darker', 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[900]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      enableArcLabels={true}
      arcLabelsRadiusOffset={0.6}
      arcLabelsSkipAngle={0}
      arcLabelsTextColor={{
        from: 'color',
        modifiers: [['darker', 3]],
      }}
      arcLabel={(d) => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const percentage = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
        return `${percentage}%`;
      }}
      defs={[
        {
          id: 'dots',
          type: 'patternDots',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: 'lines',
          type: 'patternLines',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 20,
          itemWidth: 140,
          itemHeight: 18,
          itemTextColor: colors.grey[900],
          itemDirection: 'left-to-right',
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: 'circle',
          data: data.map((item) => {
            const total = data.reduce((sum, d) => sum + d.value, 0);
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return {
              id: item.id,
              label: `${item.label}: ${item.value} (${percentage}%)`,
              color: item.color || item.id,
            };
          }),
        },
      ]}
    />
  );
};

export default PieChart;

