import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, HelpCircle, Users, Trophy, Coins, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Quiz, QuizAttempt } from '@/hooks/useQuizzes';

interface QuizCardProps {
  quiz: Quiz;
  bestAttempt?: QuizAttempt | null;
  onStart: () => void;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const difficultyLabels = {
  easy: { en: 'Easy', vi: 'Dễ' },
  medium: { en: 'Medium', vi: 'Trung bình' },
  hard: { en: 'Hard', vi: 'Khó' },
};

export function QuizCard({ quiz, bestAttempt, onStart }: QuizCardProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  const difficulty = quiz.difficulty as keyof typeof difficultyColors;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {/* Header image or gradient */}
      <div className="relative h-32 bg-gradient-to-br from-primary/30 to-primary/5">
        {quiz.image_url ? (
          <img 
            src={quiz.image_url} 
            alt={quiz.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HelpCircle className="w-16 h-16 text-primary/30" />
          </div>
        )}

        {/* Difficulty badge */}
        <Badge 
          className={`absolute top-3 left-3 ${difficultyColors[difficulty] || difficultyColors.medium}`}
        >
          {isVi ? difficultyLabels[difficulty]?.vi : difficultyLabels[difficulty]?.en || 'Medium'}
        </Badge>

        {/* Best score badge */}
        {bestAttempt && (
          <Badge 
            className="absolute top-3 right-3 bg-yellow-500 text-white"
          >
            <Trophy className="w-3 h-3 mr-1" />
            {bestAttempt.percentage}%
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {isVi && quiz.title_vi ? quiz.title_vi : quiz.title}
        </h3>
        
        {quiz.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {isVi && quiz.description_vi ? quiz.description_vi : quiz.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            <span>{quiz.questions_count} {isVi ? 'câu' : 'questions'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{quiz.duration_minutes} {isVi ? 'phút' : 'min'}</span>
          </div>

          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{quiz.attempts_count}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <Badge variant="outline" className="gap-1">
          <Coins className="w-3 h-3 text-yellow-500" />
          +{quiz.points_reward} {isVi ? 'điểm' : 'pts'}
        </Badge>

        <Button onClick={onStart} className="gap-2">
          <Play className="w-4 h-4" />
          {bestAttempt ? (isVi ? 'Làm lại' : 'Retry') : (isVi ? 'Bắt đầu' : 'Start')}
        </Button>
      </CardFooter>
    </Card>
  );
}
