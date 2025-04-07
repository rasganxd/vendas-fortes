
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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
    <Card className={`${className} overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100`}>
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
        <CardTitle className="text-blue-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer 
          className="h-[300px]"
          config={{
            mesAtual: { 
              label: "Mês Atual",
              theme: { light: "#8B5CF6", dark: "#A78BFA" } 
            },
            mesPassado: { 
              label: "Mês Passado",
              theme: { light: "#0EA5E9", dark: "#38BDF8" } 
            }
          }}
        >
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <defs>
              <linearGradient id="colorMesAtual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorMesPassado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280" 
              tick={{ fill: '#4b5563' }} 
              axisLine={{ stroke: '#d1d5db' }} 
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fill: '#4b5563' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickFormatter={(value) => `R$${value/1000}k`}
            />
            <ChartTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-[#8B5CF6]" />
                          <span className="text-xs font-medium">Mês Atual:</span>
                        </div>
                        <span className="text-xs font-medium text-right">
                          R$ {payload[0].value.toLocaleString('pt-BR')}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-[#0EA5E9]" />
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
              stroke="#8B5CF6" 
              fillOpacity={1}
              fill="url(#colorMesAtual)"
              strokeWidth={3}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="mesPassado" 
              name="Mês Passado" 
              stroke="#0EA5E9"
              fillOpacity={1}
              fill="url(#colorMesPassado)"
              strokeWidth={3}
              activeDot={{ r: 6, stroke: '#0EA5E9', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
