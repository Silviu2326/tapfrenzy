import { IntroVideo } from '../IntroVideo';

interface IntroProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function Intro({ onComplete, onSkip }: IntroProps) {
  return (
    <IntroVideo 
      onComplete={onComplete}
      onSkip={onSkip}
    />
  );
}
