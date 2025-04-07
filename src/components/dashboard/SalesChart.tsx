
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
  AreaChart,
  ComposedChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChartBig, LineChart as LineChartIcon, PieChart } from 'lucide-react';

interface SalesData {
  name: string;
  mesAtual: number;
  mesPassado: number;
  meta: number;
}

const data: SalesData[] = [
  { name: 'Jan', mesAtual: 4200, mesPassado: 2500, meta: 4000 },
  { name: 'Fev', mesAtual: 3000, mesPassado: 1500, meta: 3500 },
  { name: 'Mar', mesAtual: 5100, mesPassado: 3800, meta: 4500 },
  { name: 'Abr', mesAtual: 2800, mesPassado: 1800, meta: 3200 },
  { name: 'Mai', mesAtual: 4000, mesPassado: 2900, meta: 3800 },
  { name: 'Jun', mesAtual: 4800, mesPassado: 3500, meta: 4200 },
];

const formatCurrency = (value: number) => 
  `R$ ${value.toLocaleString('pt-BR')}`;

interface SalesChartProps {
  title: string;
  className?: string;
}

export default function SalesChart({ title, className }: SalesChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Comparativo do desempenho de vendas dos últimos meses
            </CardDescription>
          </div>
          <Tabs value={chartType} onValueChange={(v) => setChartType(v as 'line' | 'area' | 'bar')}>
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="line" className="px-2 py-0">
                <LineChartIcon className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="area" className="px-2 py-0">
                <PieChart className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="bar" className="px-2 py-0">
                <BarChartBig className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value/1000}k`} />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))} 
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="mesAtual" 
                name="Mês Atual" 
                stroke="#1e40af" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#1e40af' }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="mesPassado" 
                name="Mês Passado" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                name="Meta" 
                stroke="#15803d" 
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ r: 0 }}
              />
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorMesAtual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e40af" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1e40af" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorMesPassado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value/1000}k`} />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))} 
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="mesAtual" 
                name="Mês Atual" 
                stroke="#1e40af" 
                fillOpacity={1} 
                fill="url(#colorMesAtual)" 
              />
              <Area 
                type="monotone" 
                dataKey="mesPassado" 
                name="Mês Passado" 
                stroke="#0ea5e9" 
                fillOpacity={1} 
                fill="url(#colorMesPassado)" 
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                name="Meta" 
                stroke="#15803d" 
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ r: 0 }}
              />
            </AreaChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value/1000}k`} />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))} 
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend />
              <Bar 
                dataKey="mesAtual" 
                name="Mês Atual" 
                fill="#1e40af" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="mesPassado" 
                name="Mês Passado" 
                fill="#0ea5e9" 
                radius={[4, 4, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                name="Meta" 
                stroke="#15803d" 
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ r: 0 }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
        <div className="flex justify-center mt-4 text-sm font-medium text-gray-500">
          <div className="flex items-center mr-4">
            <span className="inline-block w-3 h-3 mr-1 bg-blue-800 rounded-sm"></span>
            <span>Mês Atual</span>
          </div>
          <div className="flex items-center mr-4">
            <span className="inline-block w-3 h-3 mr-1 bg-blue-400 rounded-sm"></span>
            <span>Mês Passado</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 mr-1 bg-green-700 rounded-sm"></span>
            <span>Meta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
