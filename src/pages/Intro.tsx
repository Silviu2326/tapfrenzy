import { useNavigate } from 'react-router-dom';
import { IntroVideo } from '../IntroVideo';

export default function Intro() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/menu');
  };

  const handleSkip = () => {
    navigate('/menu');
  };

  return (
    <IntroVideo 
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
