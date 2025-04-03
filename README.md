# Community_Web

## 설명
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
    - 배포 기록
        - [배포](https://evening-adapter-5d0.notion.site/1a51a3736ea5806eafa7cb69bb064b64)

5. 기술 
   - Node.js
   - Express.js
   - Docker
   - Mysql
   - Redis
6. 환경 
   - Ubuntu
   - VScode
   - Teraterm 또는 iterm
   - Git
   - GitHub Action
   - flyway

## 구성

1. 커뮤니티 웹 어플리케이션
    - 메인페이지
    - 장르 별 게시판
    - 게시글
        - 글 작성
        - 게시글 메인
        - 댓글
            - 대댓글
        - 게시글 리스트
            - 게시글 내부에서 게시글 리스트 확인
    - 검색
        - 게시글 검색
        - 댓글 검색
    - 유저 정보
        - 작성한 게시글
        - 활동
            - 댓글 활동
        - 회원 설정
          - 회원 정보
            - 닉네임 변경
          - 계정 설정
            - 비밀번호 변경
            - 소셜 연동 해제
    - 회원가입
    - 로그인
        - 소셜 로그인
            - 일반 회원, 소셜 연동 지원  
            - `GitHub` 소셜 로그인 지원
            - `Naver` 소셜 로그인 지원  
        - 일반 로그인
          - 일반 회원가입 지원

2. 접근방식 채택
         
    1. 아키텍처
       - 구조
         ![구상도](https://github.com/user-attachments/assets/f6f23a1f-9a37-4aee-b503-93619b302d37)

    2. MySql
       1. ERD
          ![image](https://github.com/user-attachments/assets/b4a409b5-cd38-41e4-bae2-d49c8f4d3faa)
       2. 테이블
          - Content
              - 게시글 리스트 
          - User
              - 유저 정보 리스트
          - Comment
              - 댓글 리스트
    
    3. Redis
       - 세션 데이터 유지를 위한, `TTL` 설정
       - 서버 확장성을 고려한, 유저 세션 관리 가능
           - 다른 `세션쿠키` 에서 로그인 할 경우, 중복 로그인 방지를 위해, 세션 삭제 처리 
    4. Docker
       - Dockerfile을 이용한, 웹 서비스 이미지화
       - Mysql, Redis, 웹 서비스를 docker-compose를 이용해, 통합 관리
       - GitHub Action 을 이용한, main 브런치 웹 서비스 자동 빌드
    
    5. CI/CD
        - GitHub Action 
           - 배포를 위한 Docker Hub Image Push
           - PROD 환경, SSH 접속을 통한 배포
               - Docker Hub Image 배포
           - PROD 환경 제어
               - docker-compose.yml 작성
               - 환경변수 파일 작성
               - 서버 환경에 맞추어, 유동적으로 서버 설정을 바꿀 수 있도록 구현

