import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { usePoll, useVotePoll } from '@/hooks/usePolls';
import { CAMLY_REWARDS } from '@/lib/camlyCoin';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface PollDisplayProps {
  pollId: string;
  language?: 'en' | 'vi';
}

export function PollDisplay({ pollId, language = 'en' }: PollDisplayProps) {
  const { data: poll, isLoading } = usePoll(pollId);
  const { mutate: vote, isPending: isVoting } = useVotePoll();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (isLoading || !poll) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg animate-pulse">
        <div className="h-5 w-3/4 bg-muted rounded mb-4" />
        <div className="space-y-2">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const hasVoted = !!poll.userVote;
  const showResults = hasVoted || poll.isExpired;

  const handleVote = () => {
    if (!selectedOption || hasVoted || poll.isExpired) return;
    vote({ pollId, optionId: selectedOption });
  };

  const getTimeRemaining = () => {
    if (!poll.ends_at) return language === 'vi' ? 'Không giới hạn' : 'No time limit';
    if (poll.isExpired) return language === 'vi' ? 'Đã kết thúc' : 'Ended';
    return formatDistanceToNow(new Date(poll.ends_at), {
      addSuffix: true,
      locale: language === 'vi' ? vi : enUS,
    });
  };

  return (
    <div className="p-4 bg-muted/30 rounded-lg space-y-4">
      {/* Question */}
      <h4 className="font-semibold text-lg">{poll.question}</h4>

      {/* Options */}
      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = poll.total_votes > 0
            ? Math.round((option.votes_count / poll.total_votes) * 100)
            : 0;
          const isSelected = selectedOption === option.id;
          const isUserVote = poll.userVote === option.id;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: option.order_index * 0.05 }}
            >
              {showResults ? (
                // Results view
                <div className={cn(
                  "relative p-3 rounded-lg border transition-all",
                  isUserVote 
                    ? "border-primary bg-primary/5" 
                    : "border-border"
                )}>
                  {/* Progress bar background */}
                  <div 
                    className={cn(
                      "absolute inset-0 rounded-lg transition-all",
                      isUserVote ? "bg-primary/20" : "bg-muted"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                  
                  {/* Content */}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isUserVote && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <span className={cn(
                        "font-medium",
                        isUserVote && "text-primary"
                      )}>
                        {option.option_text}
                      </span>
                    </div>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                </div>
              ) : (
                // Voting view
                <button
                  onClick={() => setSelectedOption(option.id)}
                  disabled={hasVoted || poll.isExpired}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 text-left transition-all",
                    "hover:border-primary/50",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 transition-all",
                      "flex items-center justify-center",
                      isSelected 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="font-medium">{option.option_text}</span>
                  </div>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Vote Button (only show if not voted and not expired) */}
      {!hasVoted && !poll.isExpired && (
        <Button
          onClick={handleVote}
          disabled={!selectedOption || isVoting}
          className="w-full gap-2"
        >
          {isVoting ? (
            language === 'vi' ? 'Đang bình chọn...' : 'Voting...'
          ) : (
            <>
              {language === 'vi' ? 'Bình chọn' : 'Vote'}
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                +{CAMLY_REWARDS.VOTE_POLL} 🪙
              </span>
            </>
          )}
        </Button>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>
            {poll.total_votes} {language === 'vi' ? 'phiếu' : 'votes'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{getTimeRemaining()}</span>
        </div>
      </div>
    </div>
  );
}
