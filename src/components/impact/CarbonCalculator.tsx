import { useState, useEffect } from 'react';
import { Calculator, Car, Zap, Utensils, TreePine, AlertCircle, Share2, Sparkles, X, Leaf } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  CarbonInput,
  calculateDailyCarbonFootprint,
  calculateYearlyCarbonFootprint,
  calculateTreesNeededToOffset,
  getCarbonLevel,
  formatCO2,
} from '@/lib/carbonCalculations';

// Emission factors for breakdown calculation
const EMISSION_FACTORS = {
  car: 0.21,
  motorbike: 0.1,
  bus: 0.089,
  flight: 90,
  electricity: 0.5,
  gas: 2.0,
  diet: { vegan: 2.5, vegetarian: 3.5, mixed: 5.0, meat_heavy: 7.5 },
};

// Average Vietnamese lifestyle sample data
const SAMPLE_DATA: CarbonInput = {
  transportation: {
    carKm: 5,
    motorbikeKm: 15,
    busKm: 3,
    flightHours: 0.1, // ~3 hours/month
  },
  energy: {
    electricityKwh: 5, // ~150 kWh/month
    gasM3: 0.3, // ~10 m³/month
  },
  diet: 'mixed',
};

export function CarbonCalculator() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
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
    breakdown: { name: string; value: number; color: string }[];
  } | null>(null);

  // Show onboarding on first visit
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('carbon-calc-onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      localStorage.setItem('carbon-calc-onboarding', 'true');
    }
  }, []);

  const calculateBreakdown = (inputData: CarbonInput) => {
    const transport = 
      inputData.transportation.carKm * EMISSION_FACTORS.car +
      inputData.transportation.motorbikeKm * EMISSION_FACTORS.motorbike +
      inputData.transportation.busKm * EMISSION_FACTORS.bus +
      inputData.transportation.flightHours * EMISSION_FACTORS.flight;
    
    const energy = 
      inputData.energy.electricityKwh * EMISSION_FACTORS.electricity +
      inputData.energy.gasM3 * EMISSION_FACTORS.gas;
    
    const diet = EMISSION_FACTORS.diet[inputData.diet];

    return [
      { name: 'Di chuyển', value: transport, color: 'hsl(var(--primary))' },
      { name: 'Năng lượng', value: energy, color: 'hsl(142, 76%, 36%)' },
      { name: 'Chế độ ăn', value: diet, color: 'hsl(142, 50%, 45%)' },
    ];
  };

  const handleCalculate = () => {
    const daily = calculateDailyCarbonFootprint(input);
    const yearly = calculateYearlyCarbonFootprint(daily);
    const treesNeeded = calculateTreesNeededToOffset(yearly);
    const level = getCarbonLevel(yearly);
    const breakdown = calculateBreakdown(input);

    setResult({ daily, yearly, treesNeeded, level, breakdown });
  };

  const handleSampleData = () => {
    setInput(SAMPLE_DATA);
    const daily = calculateDailyCarbonFootprint(SAMPLE_DATA);
    const yearly = calculateYearlyCarbonFootprint(daily);
    const treesNeeded = calculateTreesNeededToOffset(yearly);
    const level = getCarbonLevel(yearly);
    const breakdown = calculateBreakdown(SAMPLE_DATA);

    setResult({ daily, yearly, treesNeeded, level, breakdown });
    toast.success('Đã điền dữ liệu mẫu! 📊');
  };

  const handleShare = () => {
    if (!result) return;
    const yearlyTons = (result.yearly / 1000).toFixed(1);
    const shareText = `Mình phát thải ${yearlyTons} tấn CO₂/năm, cần trồng ${result.treesNeeded} cây để bù đắp! Bạn thì sao? 🌱 #SongXanh #GreenEarth`;
    
    navigator.clipboard.writeText(shareText);
    toast.success('Đã sao chép nội dung! Chia sẻ lên mạng xã hội ngay 🌱');
    setShowShareDialog(false);
  };

  const getLevelText = (level: 'low' | 'medium' | 'high' | 'very_high') => {
    switch (level) {
      case 'low': return { text: 'Thấp - Tuyệt vời! 👍', emoji: '🌟' };
      case 'medium': return { text: 'Trung bình 📊', emoji: '💪' };
      case 'high': return { text: 'Cao ⚠️', emoji: '🔥' };
      case 'very_high': return { text: 'Rất cao - Cần cải thiện 🚨', emoji: '⚡' };
    }
  };

  const getLevelColor = (level: 'low' | 'medium' | 'high' | 'very_high') => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'very_high': return 'text-red-500';
    }
  };

  return (
    <>
      {/* Onboarding Popup */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowOnboarding(false)}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-card rounded-2xl p-6 max-w-md shadow-xl border border-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Chào mừng đến Carbon Calculator! 🌱</h3>
                <p className="text-muted-foreground mb-6">
                  Nhập thói quen hàng ngày để tính lượng carbon bạn phát thải và biết cần trồng bao nhiêu cây để bù đắp nhé!
                </p>
                <Button onClick={() => setShowOnboarding(false)} className="w-full">
                  Bắt đầu tính toán
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Chia sẻ kết quả
            </DialogTitle>
          </DialogHeader>
          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg text-sm">
                <p>Mình phát thải {(result.yearly / 1000).toFixed(1)} tấn CO₂/năm, cần trồng {result.treesNeeded} cây để bù đắp! Bạn thì sao? 🌱 #SongXanh #GreenEarth</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleShare} className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Sao chép & Chia sẻ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            {/* Sample Data Button */}
            <Button
              variant="outline"
              onClick={handleSampleData}
              className="w-full border-dashed border-primary/50 hover:bg-primary/10"
            >
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Thử với dữ liệu mẫu (người Việt trung bình)
            </Button>

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
                    value={input.transportation.carKm || ''}
                    onChange={(e) => setInput({
                      ...input,
                      transportation: { ...input.transportation, carKm: Number(e.target.value) }
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motorbike">Xe máy (km/ngày)</Label>
                  <Input
                    id="motorbike"
                    type="number"
                    min="0"
                    value={input.transportation.motorbikeKm || ''}
                    onChange={(e) => setInput({
                      ...input,
                      transportation: { ...input.transportation, motorbikeKm: Number(e.target.value) }
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bus">Xe bus (km/ngày)</Label>
                  <Input
                    id="bus"
                    type="number"
                    min="0"
                    value={input.transportation.busKm || ''}
                    onChange={(e) => setInput({
                      ...input,
                      transportation: { ...input.transportation, busKm: Number(e.target.value) }
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flight">Bay (giờ/tháng)</Label>
                  <Input
                    id="flight"
                    type="number"
                    min="0"
                    value={Math.round(input.transportation.flightHours * 30) || ''}
                    onChange={(e) => setInput({
                      ...input,
                      transportation: { ...input.transportation, flightHours: Number(e.target.value) / 30 }
                    })}
                    placeholder="0"
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
                    value={Math.round(input.energy.electricityKwh * 30) || ''}
                    onChange={(e) => setInput({
                      ...input,
                      energy: { ...input.energy, electricityKwh: Number(e.target.value) / 30 }
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gas">Gas (m³/tháng)</Label>
                  <Input
                    id="gas"
                    type="number"
                    min="0"
                    value={Math.round(input.energy.gasM3 * 30) || ''}
                    onChange={(e) => setInput({
                      ...input,
                      energy: { ...input.energy, gasM3: Number(e.target.value) / 30 }
                    })}
                    placeholder="0"
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

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Calculator className="mr-2 h-4 w-4" />
              Tính toán Carbon Footprint
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Result */}
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-green-500/10 border border-primary/20">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-bold mb-2"
                  >
                    {formatCO2(result.yearly)}
                  </motion.div>
                  <div className="text-muted-foreground mb-3">CO₂ phát thải mỗi năm</div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`text-xl font-bold ${getLevelColor(result.level)}`}
                  >
                    {getLevelText(result.level).emoji} {getLevelText(result.level).text}
                  </motion.div>
                </div>

                {/* Pie Chart */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result.breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        animationDuration={800}
                      >
                        {result.breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)} kg/ngày`, '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend
                        formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="text-2xl font-bold text-primary">
                      {result.daily.toFixed(1)} kg
                    </div>
                    <div className="text-sm text-muted-foreground">CO₂/ngày</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                      <TreePine className="w-5 h-5" />
                      {result.treesNeeded}
                    </div>
                    <div className="text-sm text-muted-foreground">Cây cần để bù đắp</div>
                  </div>
                </div>

                {/* Suggestion Box */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <TreePine className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Gợi ý</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Trồng {result.treesNeeded} cây qua Green Earth để bù đắp carbon. 
                        Mỗi cây hấp thụ ~22kg CO₂/năm.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <Button
                  onClick={() => setShowShareDialog(true)}
                  variant="outline"
                  className="w-full border-primary/50 hover:bg-primary/10"
                  size="lg"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Chia sẻ kết quả
                </Button>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Nhập thông tin bên trái để tính toán carbon footprint
                </p>
                <Button variant="ghost" onClick={handleSampleData} size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Hoặc thử với dữ liệu mẫu
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
