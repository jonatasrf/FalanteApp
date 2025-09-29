import React, { useRef, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SampleNextArrow, SamplePrevArrow } from "./CarouselArrows";

export default function RecommendedCarousel({ conversations, onConversationStart, conversationProgress, userLevel = 'A1' }) {
  const slider = useRef(null);

  // Filtrar apenas conversas não completadas
  const incompleteConversations = useMemo(() => {
    return conversations.filter(conv => {
      const progress = conversationProgress && conversationProgress[conv.id];
      return !progress || !progress.dialogue_completed;
    });
  }, [conversations, conversationProgress]);

  // Sistema de recomendação baseado no nível do usuário
  const recommendedConversations = useMemo(() => {
    if (incompleteConversations.length === 0) return [];

    // Definir ordem de prioridade de níveis
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C3'];
    const currentLevelIndex = levelOrder.indexOf(userLevel);

    // Filtrar conversas do nível atual e próximos níveis
    const relevantLevels = levelOrder.slice(currentLevelIndex, currentLevelIndex + 2);

    let recommendations = incompleteConversations.filter(conv =>
      relevantLevels.includes(conv.level)
    );

    // Se não houver conversas dos níveis relevantes, incluir todas as não completadas
    if (recommendations.length === 0) {
      recommendations = incompleteConversations;
    }

    // Embaralhar para variar as recomendações
    const shuffled = [...recommendations].sort(() => Math.random() - 0.5);

    // Retornar no máximo 8 recomendações
    return shuffled.slice(0, 8);
  }, [incompleteConversations, userLevel]);

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

  if (recommendedConversations.length === 0) {
    return null; // Não mostrar se não houver recomendações
  }

  return (
    <div className="conversation-carousel recommended-carousel">
      <div className="carousel-header">
        <h2>🎯 Recommended for You</h2>
        <div className="carousel-arrows">
          <SamplePrevArrow onClick={() => slider.current?.slickPrev()} />
          <SampleNextArrow onClick={() => slider.current?.slickNext()} />
        </div>
      </div>
      <Slider ref={slider} {...settings}>
        {recommendedConversations.map((conv) => {
          const progress = conversationProgress && conversationProgress[conv.id];
          // Considerar completado apenas se o quiz foi completado (isso significa que dialogo + quiz foram feitos)
          const isCompleted = progress && progress.quiz_completed;

          return (
            <div
              key={conv.id}
              className="conversation-card recommended-card"
              onClick={() => onConversationStart(conv)}
              style={{
                border: '2px solid #FF385C',
                background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)'
              }}
            >
              <img
                src={conv.image_url}
                alt={conv.title}
                className="conversation-card-image"
              />
              <div className="conversation-card-star" style={{
                color: isCompleted ? '#FFD700' : '#666666',
                fontSize: '1.4rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                textShadow: isCompleted ? '0 0 8px rgba(255, 215, 0, 0.5)' : 'none'
              }}>
                ★
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
                    background: '#FF385C',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '2px 6px',
                    fontSize: '0.6rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>
                    NEW
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
