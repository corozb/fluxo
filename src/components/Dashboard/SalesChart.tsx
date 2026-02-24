import { useMemo } from 'react';
import { usePOSStore, Sale } from '@/stores/posStore';
import { formatNumber } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { eachDayOfInterval, format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from './DateRangeFilter';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  dateRange: DateRange;
  sales: Sale[];
}

export function SalesChart({ dateRange, sales }: SalesChartProps) {

  const chartData = useMemo(() => {
    // Generate array of dates within the range
    let days: Date[] = [];
    try {
      days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    } catch (e) {
      // Fallback for invalid interval (e.g. start > end) or single point if strict
      if (isSameDay(dateRange.from, dateRange.to)) {
        days = [dateRange.from];
      } else {
        days = [dateRange.from, dateRange.to];
      }
    }

    const salesByDay = days.map(date => {
      return sales
        .filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return isSameDay(saleDate, date);
        })
        .reduce((total, sale) => total + sale.total, 0);
    });

    return {
      labels: days.map(date => format(date, 'd MMM', { locale: es })),
      datasets: [
        {
          label: 'Ventas',
          data: salesByDay,
          borderColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--primary) / 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [sales, dateRange]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatNumber(value, '$');
          }
        }
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Ventas</CardTitle>
        <CardDescription>
          {format(dateRange.from, 'd MMM, yyyy', { locale: es })} - {format(dateRange.to, 'd MMM, yyyy', { locale: es })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Line data={chartData} options={options} />
      </CardContent>
    </Card>
  );
}