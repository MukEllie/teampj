const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ====================================
// River Dice 카드 덱 관리 시스템
// ====================================

// 플레이어 카드 목록 조회
router.get('/player/:playerId', async (req, res) => {
  const { playerId } = req.params;
  
  try {
    const { inDeckOnly = false, sortBy = 'rarity', order = 'DESC' } = req.query;

    console.log(`🃏 ${playerId} 플레이어 카드 조회`);

    // skills 테이블에서 기본 카드 정보 조회
    let query = `
      SELECT 
        s.*,
        CASE s.rarity
          WHEN 'Test' THEN 4
          WHEN 'SR' THEN 3  
          WHEN 'R' THEN 2
          WHEN 'N' THEN 1
          ELSE 0
        END as rarityOrder
      FROM skills s
      WHERE 1=1
    `;

    const params = [];

    // 정렬 옵션
    const validSortColumns = ['rarity', 'min_damage', 'Name'];
    const sortColumn = validSortColumns.includes(sortBy) ? 
      (sortBy === 'rarity' ? 'rarityOrder' : sortBy) : 'rarityOrder';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${sortOrder}, s.Name ASC LIMIT 50`;

    const playerCards = await executeQuery(query, params);

    if (playerCards.length === 0) {
      return res.json({
        success: true,
        message: '카드 정보가 없습니다.',
        playerId,
        data: {
          cards: [],
          summary: {
            total: 0,
            byRarity: {},
            byJob: {}
          }
        }
      });
    }

    // 카드 통계 계산
    const summary = {
      total: playerCards.length,
      byRarity: {},
      byJob: {},
      byElement: {}
    };

    playerCards.forEach(card => {
      summary.byRarity[card.rarity] = (summary.byRarity[card.rarity] || 0) + 1;
      summary.byJob[card.skill_Job] = (summary.byJob[card.skill_Job] || 0) + 1;
      summary.byElement[card.element] = (summary.byElement[card.element] || 0) + 1;
    });

    res.json({
      success: true,
      message: `${playerId} 플레이어 카드 조회 성공`,
      playerId,
      filters: { inDeckOnly, sortBy, order },
      data: {
        cards: playerCards,
        summary
      }
    });

  } catch (error) {
    console.error(`❌ 플레이어 카드 조회 에러 (${playerId}):`, error);
    res.status(500).json({
      success: false,
      message: '플레이어 카드 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 카드 정보 조회
router.get('/:cardId', async (req, res) => {
  const { cardId } = req.params;
  
  try {
    console.log(`🎯 카드 ${cardId} 상세 조회`);

    const cards = await executeQuery(
      'SELECT * FROM skills WHERE SkillID = ?',
      [cardId]
    );

    if (cards.length === 0) {
      return res.status(404).json({
        success: false,
        message: '카드를 찾을 수 없습니다.',
        cardId
      });
    }

    const card = cards[0];
    res.json({
      success: true,
      message: '카드 상세 정보 조회 성공',
      data: card
    });

  } catch (error) {
    console.error(`❌ 카드 ${cardId} 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: '카드 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;