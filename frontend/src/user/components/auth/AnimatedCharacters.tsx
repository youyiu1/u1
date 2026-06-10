import React, { useEffect, useRef, useState } from 'react';

type PupilProps = {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
};

type EyeBallProps = {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
};

type AnimatedCharactersProps = {
  isTyping?: boolean;
  showPassword?: boolean;
  passwordLength?: number;
  hasError?: boolean;
};

export function Pupil({
  size = 12,
  maxDistance = 5,
  pupilColor = 'black',
  forceLookX,
  forceLookY,
}: PupilProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) {
      return { x: 0, y: 0 };
    }

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;
    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
}

export function EyeBall({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = 'white',
  pupilColor = 'black',
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) {
      return { x: 0, y: 0 };
    }

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;
    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center rounded-full transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking ? (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      ) : null}
    </div>
  );
}

export function AnimatedCharacters({
  isTyping = false,
  showPassword = false,
  passwordLength = 0,
  hasError = false,
}: AnimatedCharactersProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement | null>(null);
  const blackRef = useRef<HTMLDivElement | null>(null);
  const yellowRef = useRef<HTMLDivElement | null>(null);
  const orangeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = window.setTimeout(() => {
        setIsPurpleBlinking(true);
        window.setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = window.setTimeout(() => {
        setIsBlackBlinking(true);
        window.setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = window.setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => window.clearTimeout(timer);
    }

    setIsLookingAtEachOther(false);
    return undefined;
  }, [isTyping]);

  useEffect(() => {
    if (passwordLength > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = window.setTimeout(() => {
          setIsPurplePeeking(true);
          window.setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };

      const firstPeek = schedulePeek();
      return () => window.clearTimeout(firstPeek);
    }

    setIsPurplePeeking(false);
    return undefined;
  }, [passwordLength, showPassword, isPurplePeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) {
      return { faceX: 0, faceY: 0, bodySkew: 0 };
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 20)),
      faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
    };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);
  const isHidingPassword = passwordLength > 0 && !showPassword;
  const [isAnnoyed, setIsAnnoyed] = useState(false);

  useEffect(() => {
    if (!hasError) {
      const resetTimer = window.setTimeout(() => setIsAnnoyed(false), 180);
      return () => window.clearTimeout(resetTimer);
    }

    const enterTimer = window.setTimeout(() => setIsAnnoyed(true), 60);
    return () => window.clearTimeout(enterTimer);
  }, [hasError]);

  return (
    <div className="relative h-[310px] w-[430px] max-w-full origin-bottom scale-[0.9] sm:scale-100">
      <div
        ref={purpleRef}
        className="absolute bottom-0 left-[58px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: '138px',
          height: isTyping || isHidingPassword ? '260px' : '236px',
          backgroundColor: '#6C3FF5',
          borderRadius: '8px 8px 0 0',
          zIndex: 1,
          transform:
            isAnnoyed
              ? `skewX(${purplePos.bodySkew + 5}deg) translateX(-6px)`
              : passwordLength > 0 && showPassword
              ? 'skewX(0deg)'
              : isTyping || isHidingPassword
                ? `skewX(${purplePos.bodySkew - 12}deg) translateX(30px)`
                : `skewX(${purplePos.bodySkew}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: isAnnoyed ? '34px' : passwordLength > 0 && showPassword ? '18px' : isLookingAtEachOther ? '44px' : `${38 + purplePos.faceX}px`,
            top: isAnnoyed ? '28px' : passwordLength > 0 && showPassword ? '22px' : isLookingAtEachOther ? '38px' : `${26 + purplePos.faceY}px`,
          }}
        >
          <EyeBall
            size={18}
            pupilSize={7}
            maxDistance={5}
            eyeColor="white"
            pupilColor="#2D2D2D"
            isBlinking={isAnnoyed ? false : isPurpleBlinking}
            forceLookX={isAnnoyed ? -5 : passwordLength > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
            forceLookY={isAnnoyed ? 1 : passwordLength > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
          />
          <EyeBall
            size={18}
            pupilSize={7}
            maxDistance={5}
            eyeColor="white"
            pupilColor="#2D2D2D"
            isBlinking={isAnnoyed ? false : isPurpleBlinking}
            forceLookX={isAnnoyed ? -5 : passwordLength > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
            forceLookY={isAnnoyed ? 1 : passwordLength > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
          />
        </div>
      </div>

      <div
        ref={blackRef}
        className="absolute bottom-0 left-[188px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: '96px',
          height: '182px',
          backgroundColor: '#2D2D2D',
          borderRadius: '8px 8px 0 0',
          zIndex: 2,
          transform:
            isAnnoyed
              ? `skewX(${blackPos.bodySkew + 4}deg) translateX(-4px)`
              : passwordLength > 0 && showPassword
              ? 'skewX(0deg)'
              : isLookingAtEachOther
                ? `skewX(${blackPos.bodySkew * 1.5 + 10}deg) translateX(16px)`
                : isTyping || isHidingPassword
                  ? `skewX(${blackPos.bodySkew * 1.5}deg)`
                  : `skewX(${blackPos.bodySkew}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-4 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: isAnnoyed ? '16px' : passwordLength > 0 && showPassword ? '10px' : isLookingAtEachOther ? '24px' : `${20 + blackPos.faceX}px`,
            top: isAnnoyed ? '22px' : passwordLength > 0 && showPassword ? '18px' : isLookingAtEachOther ? '10px' : `${24 + blackPos.faceY}px`,
          }}
        >
          <EyeBall
            size={15}
            pupilSize={5}
            maxDistance={4}
            eyeColor="white"
            pupilColor="#2D2D2D"
            isBlinking={isAnnoyed ? false : isBlackBlinking}
            forceLookX={isAnnoyed ? -4 : passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
            forceLookY={isAnnoyed ? 2 : passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined}
          />
          <EyeBall
            size={15}
            pupilSize={5}
            maxDistance={4}
            eyeColor="white"
            pupilColor="#2D2D2D"
            isBlinking={isAnnoyed ? false : isBlackBlinking}
            forceLookX={isAnnoyed ? -4 : passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
            forceLookY={isAnnoyed ? 2 : passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined}
          />
        </div>
      </div>

      <div
        ref={orangeRef}
        className="absolute bottom-0 left-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: '192px',
          height: '134px',
          zIndex: 3,
          backgroundColor: '#FF9B6B',
          borderRadius: '96px 96px 0 0',
          transform: passwordLength > 0 && showPassword ? 'skewX(0deg)' : `skewX(${orangePos.bodySkew}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: isAnnoyed ? '64px' : passwordLength > 0 && showPassword ? '48px' : `${70 + orangePos.faceX}px`,
            top: isAnnoyed ? '66px' : passwordLength > 0 && showPassword ? '58px' : `${62 + orangePos.faceY}px`,
          }}
        >
          <Pupil
            size={8}
            maxDistance={5}
            pupilColor="#2D2D2D"
            forceLookX={isAnnoyed ? -3 : passwordLength > 0 && showPassword ? -5 : undefined}
            forceLookY={isAnnoyed ? 1 : passwordLength > 0 && showPassword ? -4 : undefined}
          />
          <Pupil
            size={8}
            maxDistance={5}
            pupilColor="#2D2D2D"
            forceLookX={isAnnoyed ? -3 : passwordLength > 0 && showPassword ? -5 : undefined}
            forceLookY={isAnnoyed ? 1 : passwordLength > 0 && showPassword ? -4 : undefined}
          />
        </div>
      </div>

      <div
        ref={yellowRef}
        className="absolute bottom-0 left-[250px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: '118px',
          height: '154px',
          backgroundColor: '#E8D754',
          borderRadius: '59px 59px 0 0',
          zIndex: 4,
          transform: passwordLength > 0 && showPassword ? 'skewX(0deg)' : `skewX(${yellowPos.bodySkew}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: isAnnoyed ? '36px' : passwordLength > 0 && showPassword ? '20px' : `${42 + yellowPos.faceX}px`,
            top: isAnnoyed ? '34px' : passwordLength > 0 && showPassword ? '24px' : `${28 + yellowPos.faceY}px`,
          }}
        >
          <Pupil
            size={8}
            maxDistance={5}
            pupilColor="#2D2D2D"
            forceLookX={isAnnoyed ? -2 : passwordLength > 0 && showPassword ? -5 : undefined}
            forceLookY={isAnnoyed ? 1 : passwordLength > 0 && showPassword ? -4 : undefined}
          />
          <Pupil
            size={8}
            maxDistance={5}
            pupilColor="#2D2D2D"
            forceLookX={isAnnoyed ? -2 : passwordLength > 0 && showPassword ? -5 : undefined}
            forceLookY={isAnnoyed ? 1 : passwordLength > 0 && showPassword ? -4 : undefined}
          />
        </div>

        <div
          className="absolute h-[3px] w-14 rounded-full bg-[#2D2D2D] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: isAnnoyed ? '26px' : passwordLength > 0 && showPassword ? '14px' : `${34 + yellowPos.faceX}px`,
            top: isAnnoyed ? '74px' : passwordLength > 0 && showPassword ? '62px' : `${66 + yellowPos.faceY}px`,
            transform: isAnnoyed ? 'rotate(-4deg)' : 'rotate(0deg)',
          }}
        />
      </div>
    </div>
  );
}
