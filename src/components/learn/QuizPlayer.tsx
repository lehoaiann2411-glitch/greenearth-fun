import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  X, Clock, ChevronRight, CheckCircle2, XCircle, 
  Trophy, Coins, RotateCcw, Share2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Quiz, QuizQuestion, useQuizQuestions, useSubmitQuizAttempt } from '@/hooks/useQuizzes';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizPlayerProps {
  quiz: Quiz | null;
  open: boolean;
  onClose: () => void;
}

type QuizState = 'intro' | 'playing' | 'results';

interface Answer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
}

export function QuizPlayer({ quiz, open, onClose }: QuizPlayerProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const { user } = useAuth();
  
  const [state, setState] = useState<QuizState>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  const { data: questions = [], isLoading } = useQuizQuestions(quiz?.id);
  const submitAttempt = useSubmitQuizAttempt();

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const score = answers.filter(a => a.isCorrect).length;

  // Timer effect
  useEffect(() => {
    if (state !== 'playing' || !quiz) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          // Time's up - auto submit
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state, quiz]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setState('intro');
      setCurrentIndex(0);
      setSelectedOption(null);
      setShowAnswer(false);
      setAnswers([]);
    }
  }, [open]);

  const handleStart = useCallback(() => {
    if (!quiz) return;
    setState('playing');
    setTimeLeft(quiz.duration_minutes * 60);
    setStartTime(Date.now());
  }, [quiz]);

  const handleSelectOption = (index: number) => {
    if (showAnswer) return;
    setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (selectedOption === null || !currentQuestion) return;

    const isCorrect = currentQuestion.options[selectedOption]?.is_correct || false;
    
    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect
    }]);
    
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (!quiz || !user) {
      setState('results');
      return;
    }

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const finalScore = answers.filter(a => a.isCorrect).length + 
      (selectedOption !== null && currentQuestion?.options[selectedOption]?.is_correct ? 1 : 0);
    
    // Calculate points (base + bonus for high score)
    let pointsEarned = quiz.points_reward;
    const percentage = (finalScore / questions.length) * 100;
    if (percentage >= 80) pointsEarned = Math.round(pointsEarned * 1.5);
    else if (percentage >= 60) pointsEarned = Math.round(pointsEarned * 1.2);
    else if (percentage < 40) pointsEarned = Math.round(pointsEarned * 0.5);

    await submitAttempt.mutateAsync({
      quizId: quiz.id,
      score: finalScore,
      totalQuestions: questions.length,
      timeTakenSeconds: timeTaken,
      answers,
      pointsEarned
    });

    setState('results');
  };

  const handleRetry = () => {
    setState('intro');
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setAnswers([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold truncate max-w-[200px]">
              {isVi && quiz.title_vi ? quiz.title_vi : quiz.title}
            </h2>
            {state === 'playing' && (
              <Badge variant={timeLeft < 60 ? 'destructive' : 'secondary'} className="gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(timeLeft)}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        {state === 'playing' && (
          <div className="px-4 pt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
              <span>{isVi ? 'Câu' : 'Question'} {currentIndex + 1}/{questions.length}</span>
              <span>{score} {isVi ? 'đúng' : 'correct'}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* Intro screen */}
            {state === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl">🧠</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {isVi ? 'Sẵn sàng chưa?' : 'Ready to Start?'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isVi && quiz.description_vi ? quiz.description_vi : quiz.description}
                  </p>
                </div>

                <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                  <div className="text-center">
                    <div className="font-bold text-lg text-foreground">{questions.length}</div>
                    <div>{isVi ? 'Câu hỏi' : 'Questions'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-foreground">{quiz.duration_minutes}</div>
                    <div>{isVi ? 'Phút' : 'Minutes'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-foreground text-yellow-500">+{quiz.points_reward}</div>
                    <div>{isVi ? 'Điểm' : 'Points'}</div>
                  </div>
                </div>

                <Button size="lg" onClick={handleStart} disabled={isLoading || questions.length === 0}>
                  {isLoading ? (isVi ? 'Đang tải...' : 'Loading...') : (isVi ? 'Bắt đầu' : 'Start Quiz')}
                </Button>
              </motion.div>
            )}

            {/* Question screen */}
            {state === 'playing' && currentQuestion && (
              <motion.div
                key={`question-${currentIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium">
                  {isVi && currentQuestion.question_vi ? currentQuestion.question_vi : currentQuestion.question}
                </h3>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = option.is_correct;
                    
                    let optionClass = 'border-border hover:border-primary/50';
                    if (showAnswer) {
                      if (isCorrect) {
                        optionClass = 'border-green-500 bg-green-500/10';
                      } else if (isSelected && !isCorrect) {
                        optionClass = 'border-red-500 bg-red-500/10';
                      }
                    } else if (isSelected) {
                      optionClass = 'border-primary bg-primary/5';
                    }

                    return (
                      <Card
                        key={idx}
                        className={cn(
                          'p-4 cursor-pointer transition-all border-2',
                          optionClass,
                          showAnswer && 'cursor-default'
                        )}
                        onClick={() => handleSelectOption(idx)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium',
                            isSelected && !showAnswer && 'border-primary bg-primary text-primary-foreground',
                            showAnswer && isCorrect && 'border-green-500 bg-green-500 text-white',
                            showAnswer && isSelected && !isCorrect && 'border-red-500 bg-red-500 text-white'
                          )}>
                            {showAnswer && isCorrect ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : showAnswer && isSelected && !isCorrect ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              String.fromCharCode(65 + idx)
                            )}
                          </div>
                          <span className="flex-1">
                            {isVi && option.text_vi ? option.text_vi : option.text}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showAnswer && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-lg bg-muted"
                  >
                    <p className="text-sm">
                      <strong>{isVi ? 'Giải thích: ' : 'Explanation: '}</strong>
                      {isVi && currentQuestion.explanation_vi ? currentQuestion.explanation_vi : currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  {!showAnswer ? (
                    <Button 
                      onClick={handleConfirm} 
                      disabled={selectedOption === null}
                    >
                      {isVi ? 'Xác nhận' : 'Confirm'}
                    </Button>
                  ) : (
                    <Button onClick={handleNext} className="gap-2">
                      {currentIndex < questions.length - 1 ? (
                        <>
                          {isVi ? 'Tiếp theo' : 'Next'}
                          <ChevronRight className="w-4 h-4" />
                        </>
                      ) : (
                        isVi ? 'Xem kết quả' : 'See Results'
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Results screen */}
            {state === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-yellow-500" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {isVi ? 'Hoàn thành!' : 'Quiz Complete!'}
                  </h3>
                  <p className="text-4xl font-bold text-primary">
                    {score}/{questions.length}
                  </p>
                  <p className="text-muted-foreground">
                    {Math.round((score / questions.length) * 100)}% {isVi ? 'chính xác' : 'correct'}
                  </p>
                </div>

                <div className="flex justify-center">
                  <Badge className="gap-2 text-lg px-4 py-2 bg-yellow-500">
                    <Coins className="w-5 h-5" />
                    +{quiz.points_reward} {isVi ? 'điểm' : 'points'}
                  </Badge>
                </div>

                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={handleRetry} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    {isVi ? 'Làm lại' : 'Retry'}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    {isVi ? 'Chia sẻ' : 'Share'}
                  </Button>
                  <Button onClick={onClose}>
                    {isVi ? 'Đóng' : 'Close'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
