import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, BarChart3, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { POLL_DURATIONS, CAMLY_REWARDS } from '@/lib/camlyCoin';

interface PollData {
  question: string;
  options: string[];
  durationDays: number;
}

interface PollCreatorProps {
  onPollChange: (poll: PollData | null) => void;
  language?: 'en' | 'vi';
}

export function PollCreator({ onPollChange, language = 'en' }: PollCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [durationDays, setDurationDays] = useState(1);

  const canAddOption = options.length < 4;
  const canRemoveOption = options.length > 2;
  const isValid = question.trim() && options.filter(o => o.trim()).length >= 2;

  const handleToggle = () => {
    if (isOpen) {
      // Closing - clear poll
      setIsOpen(false);
      setQuestion('');
      setOptions(['', '']);
      setDurationDays(1);
      onPollChange(null);
    } else {
      setIsOpen(true);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    
    if (question.trim() && newOptions.filter(o => o.trim()).length >= 2) {
      onPollChange({ question, options: newOptions.filter(o => o.trim()), durationDays });
    }
  };

  const addOption = () => {
    if (canAddOption) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (canRemoveOption) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      if (question.trim() && newOptions.filter(o => o.trim()).length >= 2) {
        onPollChange({ question, options: newOptions.filter(o => o.trim()), durationDays });
      }
    }
  };

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
    const validOptions = options.filter(o => o.trim());
    if (value.trim() && validOptions.length >= 2) {
      onPollChange({ question: value, options: validOptions, durationDays });
    }
  };

  const handleDurationChange = (value: string) => {
    const days = parseInt(value);
    setDurationDays(days);
    const validOptions = options.filter(o => o.trim());
    if (question.trim() && validOptions.length >= 2) {
      onPollChange({ question, options: validOptions, durationDays: days });
    }
  };

  return (
    <div className="space-y-2">
      {/* Toggle Button */}
      <Button
        type="button"
        variant={isOpen ? "secondary" : "ghost"}
        size="sm"
        onClick={handleToggle}
        className="gap-2"
      >
        <BarChart3 className="w-4 h-4" />
        <span>{language === 'vi' ? 'Khảo sát' : 'Poll'}</span>
        {isOpen && (
          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
            +{CAMLY_REWARDS.CREATE_POLL} 🪙
          </span>
        )}
      </Button>

      {/* Poll Creator Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 space-y-4 border-primary/30">
              {/* Question */}
              <div>
                <Input
                  placeholder={language === 'vi' ? 'Đặt câu hỏi...' : 'Ask a question...'}
                  value={question}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  className="font-medium"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                {options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 border-muted-foreground/30",
                      "flex items-center justify-center text-xs text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <Input
                      placeholder={`${language === 'vi' ? 'Lựa chọn' : 'Option'} ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1"
                    />
                    {canRemoveOption && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}

                {/* Add Option Button */}
                {canAddOption && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addOption}
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {language === 'vi' ? 'Thêm lựa chọn' : 'Add option'}
                  </Button>
                )}
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {language === 'vi' ? 'Thời gian:' : 'Poll length:'}
                </span>
                <Select value={durationDays.toString()} onValueChange={handleDurationChange}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POLL_DURATIONS.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value.toString()}>
                        {language === 'vi' ? duration.label_vi : duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Validation Message */}
              {!isValid && (question || options.some(o => o)) && (
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' 
                    ? 'Cần có câu hỏi và ít nhất 2 lựa chọn' 
                    : 'Need a question and at least 2 options'}
                </p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
