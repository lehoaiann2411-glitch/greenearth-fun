import { useState } from 'react';
import { Calculator, Car, Zap, Utensils, TreePine, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CarbonInput,
  calculateDailyCarbonFootprint,
  calculateYearlyCarbonFootprint,
  calculateTreesNeededToOffset,
  getCarbonLevel,
  getCarbonLevelColor,
  formatCO2,
} from '@/lib/carbonCalculations';

export function CarbonCalculator() {
  const [input, setInput] = useState<CarbonInput>({
    transportation: {
      carKm: 0,
      motorbikeKm: 0,
      busKm: 0,
      flightHours: 0,
    },
    energy: {
      electricityKwh: 0,
      gasM3: 0,
    },
    diet: 'mixed',
  });

  const [result, setResult] = useState<{
    daily: number;
    yearly: number;
    treesNeeded: number;
    level: 'low' | 'medium' | 'high' | 'very_high';
  } | null>(null);

  const handleCalculate = () => {
    const daily = calculateDailyCarbonFootprint(input);
    const yearly = calculateYearlyCarbonFootprint(daily);
    const treesNeeded = calculateTreesNeededToOffset(yearly);
    const level = getCarbonLevel(yearly);

    setResult({ daily, yearly, treesNeeded, level });
  };

  const getLevelText = (level: 'low' | 'medium' | 'high' | 'very_high') => {
    switch (level) {
      case 'low': return 'Thấp - Tuyệt vời!';
      case 'medium': return 'Trung bình';
      case 'high': return 'Cao';
      case 'very_high': return 'Rất cao - Cần cải thiện';
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Nhập thói quen hàng ngày
          </CardTitle>
          <CardDescription>
            Ước tính lượng carbon bạn phát thải mỗi ngày
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transportation */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Car className="h-4 w-4" />
              Di chuyển
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="car">Ô tô (km/ngày)</Label>
                <Input
                  id="car"
                  type="number"
                  min="0"
                  value={input.transportation.carKm}
                  onChange={(e) => setInput({
                    ...input,
                    transportation: { ...input.transportation, carKm: Number(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motorbike">Xe máy (km/ngày)</Label>
                <Input
                  id="motorbike"
                  type="number"
                  min="0"
                  value={input.transportation.motorbikeKm}
                  onChange={(e) => setInput({
                    ...input,
                    transportation: { ...input.transportation, motorbikeKm: Number(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bus">Xe bus (km/ngày)</Label>
                <Input
                  id="bus"
                  type="number"
                  min="0"
                  value={input.transportation.busKm}
                  onChange={(e) => setInput({
                    ...input,
                    transportation: { ...input.transportation, busKm: Number(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flight">Bay (giờ/tháng)</Label>
                <Input
                  id="flight"
                  type="number"
                  min="0"
                  value={input.transportation.flightHours}
                  onChange={(e) => setInput({
                    ...input,
                    transportation: { ...input.transportation, flightHours: Number(e.target.value) / 30 }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Energy */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Năng lượng
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="electricity">Điện (kWh/tháng)</Label>
                <Input
                  id="electricity"
                  type="number"
                  min="0"
                  value={input.energy.electricityKwh * 30}
                  onChange={(e) => setInput({
                    ...input,
                    energy: { ...input.energy, electricityKwh: Number(e.target.value) / 30 }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gas">Gas (m³/tháng)</Label>
                <Input
                  id="gas"
                  type="number"
                  min="0"
                  value={input.energy.gasM3 * 30}
                  onChange={(e) => setInput({
                    ...input,
                    energy: { ...input.energy, gasM3: Number(e.target.value) / 30 }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Diet */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Chế độ ăn
            </h3>
            <Select
              value={input.diet}
              onValueChange={(value: 'vegan' | 'vegetarian' | 'mixed' | 'meat_heavy') => 
                setInput({ ...input, diet: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chế độ ăn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegan">Thuần chay (Vegan)</SelectItem>
                <SelectItem value="vegetarian">Ăn chay</SelectItem>
                <SelectItem value="mixed">Hỗn hợp</SelectItem>
                <SelectItem value="meat_heavy">Nhiều thịt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            Tính toán
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Kết quả</CardTitle>
          <CardDescription>
            Lượng carbon footprint ước tính của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="text-center p-6 rounded-lg bg-muted/50">
                <div className="text-4xl font-bold mb-2">
                  {formatCO2(result.yearly)}
                </div>
                <div className="text-muted-foreground">CO₂ phát thải mỗi năm</div>
                <div className={`mt-2 font-medium ${getCarbonLevelColor(result.level)}`}>
                  {getLevelText(result.level)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold text-primary">
                    {result.daily.toFixed(1)} kg
                  </div>
                  <div className="text-sm text-muted-foreground">CO₂/ngày</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10">
                  <div className="text-2xl font-bold text-green-600">
                    {result.treesNeeded}
                  </div>
                  <div className="text-sm text-muted-foreground">Cây cần để bù đắp</div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <TreePine className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Gợi ý</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Trồng {result.treesNeeded} cây thông qua Green Earth để bù đắp lượng carbon của bạn. 
                      Mỗi cây hấp thụ khoảng 22kg CO₂ mỗi năm.
                    </p>
                    <Button variant="link" className="p-0 h-auto mt-2">
                      Tham gia chiến dịch trồng cây →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nhập thông tin bên trái để tính toán carbon footprint
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
