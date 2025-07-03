
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VisitSequenceManagerProps {
  visitDays: string[];
  visitSequence: number;
  visitSequences?: Record<string, number>;
  onVisitSequenceChange: (value: number) => void;
  onVisitSequencesChange: (value: Record<string, number> | undefined) => void;
}

const dayLabels: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

export const VisitSequenceManager: React.FC<VisitSequenceManagerProps> = ({
  visitDays,
  visitSequence,
  visitSequences,
  onVisitSequenceChange,
  onVisitSequencesChange
}) => {
  const [useAdvancedSequencing, setUseAdvancedSequencing] = useState(!!visitSequences);

  const handleToggleMode = (advanced: boolean) => {
    setUseAdvancedSequencing(advanced);
    
    if (advanced) {
      // Create visit sequences for selected days using current visitSequence as default
      const newSequences: Record<string, number> = {};
      visitDays.forEach(day => {
        newSequences[day] = visitSequence || 1;
      });
      onVisitSequencesChange(newSequences);
    } else {
      // Switch back to simple mode
      onVisitSequencesChange(undefined);
    }
  };

  const handleDaySequenceChange = (day: string, sequence: number) => {
    if (!visitSequences) return;
    
    const newSequences = {
      ...visitSequences,
      [day]: sequence
    };
    onVisitSequencesChange(newSequences);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="sequencing-mode">Sequenciamento Avançado</Label>
        <Switch
          id="sequencing-mode"
          checked={useAdvancedSequencing}
          onCheckedChange={handleToggleMode}
        />
      </div>

      {!useAdvancedSequencing ? (
        <div>
          <Label htmlFor="visitSequence">Sequência de Visita</Label>
          <Input
            id="visitSequence"
            type="number"
            min="1"
            value={visitSequence || ''}
            onChange={(e) => onVisitSequenceChange(parseInt(e.target.value) || 1)}
            placeholder="Ordem de visita"
          />
          <p className="text-sm text-gray-500 mt-1">
            Mesma sequência para todos os dias de visita
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sequência por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {visitDays.length === 0 ? (
              <p className="text-sm text-gray-500">
                Selecione os dias de visita primeiro para definir as sequências.
              </p>
            ) : (
              visitDays.map(day => (
                <div key={day} className="flex items-center justify-between">
                  <Label htmlFor={`sequence-${day}`} className="text-sm">
                    {dayLabels[day] || day}
                  </Label>
                  <div className="w-20">
                    <Input
                      id={`sequence-${day}`}
                      type="number"
                      min="1"
                      value={visitSequences?.[day] || ''}
                      onChange={(e) => handleDaySequenceChange(day, parseInt(e.target.value) || 1)}
                      placeholder="1"
                      className="text-center"
                    />
                  </div>
                </div>
              ))
            )}
            <p className="text-xs text-gray-500 mt-2">
              Defina a ordem de visita específica para cada dia da semana.
              Números menores indicam prioridade maior.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
