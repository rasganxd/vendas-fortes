
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

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

export default function SalesChart({ title, className }: SalesChartProps) {
  return (
    <Card className={`${className} overflow-hidden bg-gradient-to-br from-white to-sales-50 border border-sales-100`}>
      <CardHeader className="pb-2 bg-gradient-to-r from-sales-50 to-sales-100 border-b border-sales-100">
        <CardTitle className="text-sales-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer 
          className="h-[300px]"
          config={{
            mesAtual: { 
              label: "Mês Atual",
              theme: { light: "#7c655b", dark: "#9a8576" } 
            },
            mesPassado: { 
              label: "Mês Passado",
              theme: { light: "#b8a99a", dark: "#d6ccc2" } 
            }
          }}
        >
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <defs>
              <linearGradient id="colorMesAtual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c655b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#7c655b" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorMesPassado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b8a99a" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#b8a99a" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eaddd7" />
            <XAxis 
              dataKey="name" 
              stroke="#9a8576" 
              tick={{ fill: '#7c655b' }} 
              axisLine={{ stroke: '#d6ccc2' }} 
            />
            <YAxis 
              stroke="#9a8576" 
              tick={{ fill: '#7c655b' }}
              axisLine={{ stroke: '#d6ccc2' }}
              tickFormatter={(value) => `R$${value/1000}k`}
            />
            <ChartTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-[#7c655b]" />
                          <span className="text-xs font-medium">Mês Atual:</span>
                        </div>
                        <span className="text-xs font-medium text-right">
                          R$ {payload[0].value.toLocaleString('pt-BR')}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-[#b8a99a]" />
                          <span className="text-xs font-medium">Mês Passado:</span>
                        </div>
                        <span className="text-xs font-medium text-right">
                          R$ {payload[1].value.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="mt-1 border-t pt-1 text-center text-xs font-medium">
                        {payload[0].payload.name}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ paddingBottom: '10px' }}
              formatter={(value, entry) => {
                return <span className="text-xs font-medium">{value}</span>;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="mesAtual" 
              name="Mês Atual" 
              stroke="#7c655b" 
              fillOpacity={1}
              fill="url(#colorMesAtual)"
              strokeWidth={3}
              activeDot={{ r: 6, stroke: '#7c655b', strokeWidth: 2, fill: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="mesPassado" 
              name="Mês Passado" 
              stroke="#b8a99a"
              fillOpacity={1}
              fill="url(#colorMesPassado)"
              strokeWidth={3}
              activeDot={{ r: 6, stroke: '#b8a99a', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
