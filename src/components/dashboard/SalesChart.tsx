
import { 
  LineChart,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';

interface SalesData {
  name: string;
  mesAtual: number;
  mesPassado: number;
}

const data: SalesData[] = [
  { name: 'Jan', mesAtual: 4200, mesPassado: 2500 },
  { name: 'Fev', mesAtual: 3000, mesPassado: 1500 },
  { name: 'Mar', mesAtual: 5100, mesPassado: 3800 },
  { name: 'Abr', mesAtual: 2800, mesPassado: 1800 },
  { name: 'Mai', mesAtual: 4000, mesPassado: 2900 },
  { name: 'Jun', mesAtual: 4800, mesPassado: 3500 },
];

interface SalesChartProps {
  title: string;
  className?: string;
}

const chartConfig = {
  mesAtual: {
    label: "Mês Atual",
    theme: {
      light: "hsl(220, 70%, 50%)",
      dark: "hsl(220, 70%, 70%)"
    }
  },
  mesPassado: {
    label: "Mês Passado",
    theme: {
      light: "hsl(173, 80%, 40%)",
      dark: "hsl(173, 80%, 60%)"
    }
  }
};

export default function SalesChart({ title, className }: SalesChartProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card className={`${className} shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          {title}
        </CardTitle>
      </CardHeader>
      
      <Tabs defaultValue="line">
        <div className="px-6 border-b">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="line" className="text-xs">Linha</TabsTrigger>
            <TabsTrigger value="bar" className="text-xs">Barras</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6 px-2">
          <TabsContent value="line" className="mt-0">
            <ChartContainer config={chartConfig} className="aspect-[4/2]">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `R$ ${value/1000}k`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          className="bg-white shadow border p-2"
                          indicator="dot"
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  align="center"
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => value === 'mesAtual' ? 'Mês Atual' : 'Mês Passado'}
                />
                <Line
                  type="monotone"
                  dataKey="mesAtual"
                  stroke="var(--color-mesAtual)"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="mesPassado"
                  stroke="var(--color-mesPassado)"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="bar" className="mt-0">
            <ChartContainer config={chartConfig} className="aspect-[4/2]">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value/1000}k`} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          className="bg-white shadow border p-2"
                          indicator="dot"
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  align="center"
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => value === 'mesAtual' ? 'Mês Atual' : 'Mês Passado'}
                />
                <Bar 
                  dataKey="mesAtual" 
                  fill="var(--color-mesAtual)" 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar 
                  dataKey="mesPassado" 
                  fill="var(--color-mesPassado)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
