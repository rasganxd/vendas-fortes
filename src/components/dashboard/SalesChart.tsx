
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className={`${className} shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorMesAtual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a365d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#1a365d" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorMesPassado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              fontSize={12} 
              tickFormatter={(value) => `R$${value/1000}k`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} 
              labelFormatter={(label) => `Mês: ${label}`}
              contentStyle={{
                borderRadius: '6px',
                border: '1px solid #eee',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle" 
              iconSize={8} 
              wrapperStyle={{ paddingTop: '10px' }} 
            />
            <Area 
              type="monotone" 
              dataKey="mesAtual" 
              name="Mês Atual" 
              stroke="#1a365d" 
              fillOpacity={1}
              fill="url(#colorMesAtual)"
              strokeWidth={2}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="mesPassado" 
              name="Mês Passado" 
              stroke="#0d9488" 
              fillOpacity={1}
              fill="url(#colorMesPassado)"
              strokeWidth={2}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
