import React, { useRef, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SampleNextArrow, SamplePrevArrow } from "./CarouselArrows";

export default function IncompleteConversationsCarousel({ conversations, onConversationStart, conversationProgress, userLevel = 'A1' }) {
  const slider = useRef(null);

  // Filtrar apenas conversas já iniciadas mas não completadas
  const incompleteConversations = useMemo(() => {
    return conversations.filter(conv => {
      const progress = conversationProgress && conversationProgress[conv.id];
      // Considerar apenas se TEM progresso E não completou totalmente
      return progress && !progress.quiz_completed;
    });
  }, [conversations, conversationProgress]);

  // Ordenar por nível de dificuldade crescente
  const sortedIncompleteConversations = useMemo(() => {
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C3'];
    return incompleteConversations
      .sort((a, b) => {
        const levelA = levelOrder.indexOf(a.level || 'A1');
        const levelB = levelOrder.indexOf(b.level || 'A1');
        return levelA - levelB;
      })
      .slice(0, 12); // Limitar a 12 conversas
  }, [incompleteConversations]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    centerMode: false,
    centerPadding: '0px',
    variableWidth: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0px',
          variableWidth: true,
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0px',
          variableWidth: true,
        }
      },
      {
        breakpoint: 768,
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

  if (sortedIncompleteConversations.length === 0) {
    return null; // Não mostrar se não houver conversas incompletas
  }

  return (
    <div className="conversation-carousel incomplete-carousel">
      <div className="carousel-header">
        <h2>🚀 Continue Learning</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '5px 0 0 0' }}>
          {sortedIncompleteConversations.length} conversations to complete
        </p>
        <div className="carousel-arrows">
          <SamplePrevArrow onClick={() => slider.current?.slickPrev()} />
          <SampleNextArrow onClick={() => slider.current?.slickNext()} />
        </div>
      </div>
      <Slider ref={slider} {...settings}>
        {sortedIncompleteConversations.map((conv) => {
          const progress = conversationProgress && conversationProgress[conv.id];

          // Simplificar: apenas verificar se está completo ou não
          const isCompleted = progress && progress.quiz_completed;
          const progressStatus = isCompleted ? 'Complete' : 'Incomplete';

          return (
            <div
              key={conv.id}
              className="conversation-card continue-card"
              onClick={() => onConversationStart(conv)}
              style={{
                border: '2px solid #FFE066',
                background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 100%)'
              }}
            >
              <img
                src={conv.image_url}
                alt={conv.title}
                className="conversation-card-image"
              />
              <div className="conversation-card-star" style={{
                color: progressStatus === 'Start' ? '#FF6B6B' : '#F39C12',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                textShadow: '0 0 4px rgba(0, 0, 0, 0.3)'
              }}>
                {progressStatus === 'Start' ? '🚀' : '📝'}
              </div>
              <div className="conversation-card-content">
                <h3>{conv.title}</h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    {conv.level ? conv.level.toUpperCase() : 'N/A'}
                  </p>
                  <div style={{
                    background: progressStatus === 'Start' ? '#FF6B6B' : '#F39C12',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '2px 6px',
                    fontSize: '0.55rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    textAlign: 'center'
                  }}>
                    {progressStatus === 'Start' ? 'START' :
                     progressStatus === 'Quiz Missing' ? 'QUIZ' : 'DIALOGUE'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}
