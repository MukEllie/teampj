const mysql = require('mysql2/promise');
const path = require('path');

// .env 파일이 src/.env에 있으므로 2단계 상위로 수정
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

console.log('🔍 데이터베이스 연결 설정 로드 중...');
console.log(`📍 DB Host: ${process.env.DB_HOST}`);
console.log(`📍 DB Name: ${process.env.DB_NAME}`);

// MySQL 8.0 연결 풀 설정 (간소화)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'testgame',
  port: 3306,
  connectionLimit: 10,
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true
});

// 데이터베이스 연결 테스트 함수
const testConnection = async () => {
  let connection = null;
  try {
    console.log('🔍 MySQL testgame 데이터베이스 연결 테스트 중...');
    connection = await pool.getConnection();
    
    const [versionResult] = await connection.execute('SELECT VERSION() as version');
    const [dbResult] = await connection.execute('SELECT DATABASE() as current_db');
    
    console.log(`✅ MySQL 버전: ${versionResult[0].version}`);
    console.log(`✅ 현재 데이터베이스: ${dbResult[0].current_db}`);
    
    return true;
  } catch (error) {
    console.error('❌ MySQL 연결 실패:', error.message);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 안전한 쿼리 실행 함수 (수정된 버전)
const executeQuery = async (query, params = []) => {
  let connection = null;
  try {
    connection = await pool.getConnection();
    
    console.log('🔍 SQL 쿼리:', query);
    console.log('🔍 파라미터:', params);
    
    // params가 빈 배열이거나 없으면 query 사용, 있으면 execute 사용
    let results;
    if (!params || params.length === 0) {
      [results] = await connection.query(query);
    } else {
      [results] = await connection.execute(query, params);
    }
    
    console.log('✅ 쿼리 실행 성공, 결과 개수:', results.length);
    return results;
    
  } catch (error) {
    console.error('❌ SQL 쿼리 실행 오류:', error.message);
    console.error('❌ 쿼리:', query);
    console.error('❌ 파라미터:', params);
    console.error('❌ 에러 코드:', error.code);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 트랜잭션 실행 함수
const executeTransaction = async (queries) => {
  let connection = null;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params = [] } of queries) {
      let result;
      if (!params || params.length === 0) {
        [result] = await connection.query(query);
      } else {
        [result] = await connection.execute(query, params);
      }
      results.push(result);
    }
    
    await connection.commit();
    console.log('✅ 트랜잭션 커밋 완료');
    return results;
  } catch (error) {
    if (connection) {
      await connection.rollback();
      console.log('🔄 트랜잭션 롤백 실행됨');
    }
    console.error('❌ 트랜잭션 실행 오류:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction
};