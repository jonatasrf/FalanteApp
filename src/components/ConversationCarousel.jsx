import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SampleNextArrow, SamplePrevArrow } from "./CarouselArrows";

export default function ConversationCarousel({ title, conversations, onConversationStart, conversationProgress, prioritizeIncomplete = false }) {
  const slider = useRef(null);

  // Ordenar conversas: não completadas primeiro (se habilitado)
  const sortedConversations = React.useMemo(() => {
    if (!prioritizeIncomplete || !conversationProgress) {
      return conversations;
    }

    return [...conversations].sort((a, b) => {
      const progressA = conversationProgress[a.id];
      const progressB = conversationProgress[b.id];
      const isCompletedA = progressA && progressA.dialogue_completed;
      const isCompletedB = progressB && progressB.dialogue_completed;

      // Se um está completo e o outro não, o incompleto vem primeiro
      if (isCompletedA && !isCompletedB) return 1;
      if (!isCompletedA && isCompletedB) return -1;

      // Se ambos têm o mesmo status, manter ordem original
      return 0;
    });
  }, [conversations, conversationProgress, prioritizeIncomplete]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    initialSlide: 0,
    centerMode: false,
    centerPadding: '0px',
    variableWidth: true,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0px',
          variableWidth: true,
        }
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0px',
          variableWidth: true,
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0px',
          variableWidth: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0px',
          variableWidth: true,
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0px',
          variableWidth: true,
        }
      }
    ]
  };

  return (
    <div className="conversation-carousel">
      <div className="carousel-header">
        <h2>{title}</h2>
        <div className="carousel-arrows">
          <SamplePrevArrow onClick={() => slider.current.slickPrev()} />
          <SampleNextArrow onClick={() => slider.current.slickNext()} />
        </div>
      </div>
      <Slider ref={slider} {...settings}>
        {sortedConversations.map((conv) => {
          const progress = conversationProgress && conversationProgress[conv.id];
          const isCompleted = progress && progress.dialogue_completed;

          return (
            <div
              key={conv.id}
              className="conversation-card"
              onClick={() => onConversationStart(conv)}
            >
              <img
                src={conv.image_url}
                alt={conv.title}
                className="conversation-card-image"
              />
              <div className="conversation-card-star" style={{
                background: isCompleted ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                color: isCompleted ? '#FFD700' : '#FFFFFF',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                fontSize: '1.5rem',
                fontWeight: 'normal'
              }}>
                {isCompleted ? '⭐' : '☆'}
              </div>
              <div className="conversation-card-content">
                <h3>{conv.title}</h3>
                <p>{conv.level ? conv.level.toUpperCase() : 'N/A'}</p>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}
