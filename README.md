# Community_Web

## 개요
1. 내용
    - 인터넷 커뮤니티 웹 서비스 개발

2. 작업기간
    - 24.10 ~ 

3. 목표
    - Node.js 기반, 웹 프레임워크 서버 구축
    - 백엔드에서 사용되는 프레임워크, 도구 학습
    - 실제 CI/CD 배포 작업

4. 정리
    - 기록
        - [작업 기록](https://evening-adapter-5d0.notion.site/1061a3736ea580208a14e89c080b27fe?v=fff1a3736ea581bcb55d000c37d1d778)
    - 배포 도메인
        - [https://mypagehhh.shop](https://mypagehhh.shop)

## 구성
1. 환경 ( 프레임 워크 )
    1. 기술 
       - Ubuntu
       - Node.js
       - Express
       - Docker
       - Mysql
       - Redis
         
    2. 아키텍처
       - 구조
         ![구상도](https://github.com/user-attachments/assets/f6f23a1f-9a37-4aee-b503-93619b302d37)


3. 커뮤니티 웹 어플리케이션
    - 메인페이지
    - 장르 별 게시판
    - 게시글
        - 글 작성
        - 게시글 메인
        - 댓글
            - 대댓글 처리
            - 삭제 처리
        - 게시글 리스트
            - 게시글 내부에서 게시글 리스트 확인
    - 검색
        - 게시글 별, 댓글 별 검색
        - 다중 페이징 처리
    - 유저 정보
        - 작성한 게시글
        - 활동
            - 댓글 활동 
    - 회원가입
        - 일반 회원가입
        - 소셜 연동 회원가입
            - 소셜 로그인 접근시, 회원가입과 동시에 연동 
    - 로그인
        - 소셜 로그인
            - 일반 회원, 소셜 연동 지원  
            - `GitHub` 소셜 로그인 지원
            - `Naver` 소셜 로그인 지원  
        - 일반 로그인
          - 일반 회원가입 지원

4. 명세서
    1. 응답 코드
    
        | 응답 코드 | 의미     | 설명                      | *특수 페이지 반환여부   | 패턴 | 비고         |
        |-------|--------|-------------------------|---------------------|--------|------------|
        | 200   | 성공     | 요청이 성공적으로 처리됨.          | ⨉             |        | GET        |
        | 201   | 생성 완료  | 데이터가 성공적으로 생성됨.         | ⨉             |        | 데이터 생성      | 
        | 204   | 삭제 완료  | 데이터가 성공적으로 삭제됨(본문 없음).  | ⨉             |        | 데이터 삭제      | 
        | 400   | 잘못된 요청 | 요청 데이터가 유효하지 않음.        | ◯             | A      | 없는 데이터 정보  | 
        | 401   | 인증 실패  | 인증이 필요하거나 JWT가 유효하지 않음. | ◯             | C      | 세션 인증      |  
        | 404   | 리소스 없음 | 요청한 리소스를 찾을 수 없음.       | ◯             | A      | 리소스 파일 없음  |  
        | 500   | 서버 오류  | 서버 내부 오류 발생.            | ◯             | B      | 서버 문제      |   |  

        - *렌더링 반환시

    2. 페이지 명세서

        | NO. | 페이지명            | HTTP Method | REST API        | 요청헤더              | 세션 필요여부 | 접근 권한 | 비고      |
        |-----|-----------------|-------------|-----------------|-------------------|---------|-------|--------------|
        | 1   | 메인              | GET         | /               | Accept: text/html | ⨉       | ALL   | SSR 요청|
        | 2   | 로그인             | GET         | /login          | Accept: text/html | ⨉       | ALL   | SSR 요청    |
        | 3   | 회원가입            | GET         | /signup         | Accept: text/html | ⨉       | ALL   | SSR 요청   |
        | 4   | 인기 카테고리         | GET         | /popular        | Accept: text/html | ⨉       | ALL   | SSR 요청    |
        | 5   | 검색 결과           | GET         | /search         | Accept: text/html | ⨉       | ALL   | SSR 요청    |
        | 6   | 질문, 생활, 정보 카테고리 | GET         | /:pagetype      | Accept: text/html | ⨉       | ALL   | SSR 요청    |
        | 7   | 게시글 작성          | GET         | /:pagetype/edit | Accept: text/html | ◯       | USER  | SSR 요청    |
        | 8   | 게시글 본문          | GET         | /:pagetype/:id  | Accept: text/html | ⨉       | ALL   | SSR 요청    |
        | 9   | 유저 정보           | GET         | /user/:user_id  | Accept: text/html | ⨉       | ALL   | SSR 요청    |

    3. API 명세서

5. MySql
   1. ERD
      ![image](https://github.com/user-attachments/assets/82cd2b88-5657-466c-a4f9-74e5e0ead8be)
   2. 테이블
      - Content
      - User
      - Comment

6. Redis
   - 세션 데이터 유지를 위한, `TTL` 설정
   - 서버 확장성을 고려한, 유저 세션 관리 가능
       - 다른 `세션쿠키` 에서 로그인 할 경우, 중복 로그인 방지를 위해, 세션 삭제 처리 
7. Docker
   - Dockerfile을 이용한, 웹 서비스 이미지화
   - Mysql, Redis, 웹 서비스를 docker-compose를 이용해, 통합 관리
   - GitHub Action 을 이용한, main 브런치 웹 서비스 자동 빌드

8. CI/CD ( 예정 )
    1. GitHub Action 
       - DEV 환경 정의
       - TEST 작업 자동화
       - 배포를 위한 Docker Hub Image Push
       - PROD 환경, SSH 접속을 통한 배포
           - Docker Hub Image 배포
           - docker-compose 작성
           - 환경변수 파일 작성

