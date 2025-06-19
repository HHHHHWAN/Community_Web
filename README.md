## Preview
![Image](https://github.com/user-attachments/assets/d1dc5a31-fa07-4417-907f-3527df3baa77)


## 설명
1. 주제
    - 인터넷 커뮤니티 웹 개발
    - SSR 환경
    - 온 프레미스 서버 구축
      
2. 작업기간
    - 24.10 ~ 유지보수 

3. 목표
    - `Node.js / Express.js` 기반, 웹 프레임워크 서버 구축
    - 웹 개발에 사용되는 프레임워크, 도구 학습
    - CI/CD 배포 작업 구축

4. 정리
    - 기록
        - [작업 기록](https://evening-adapter-5d0.notion.site/1061a3736ea580208a14e89c080b27fe?v=fff1a3736ea581bcb55d000c37d1d778)
    - 배포 도메인
        - [https://mypagehhh.shop](https://mypagehhh.shop)
    - 배포 기록
        - [릴리즈 기록](https://evening-adapter-5d0.notion.site/1a51a3736ea5806eafa7cb69bb064b64)

5. 기술 
   - **Node.js**
   - **Express.js**
   - **JavaScript**
   - MySQL
   - Redis
   - HTML
   - CSS

6. 환경
   - **VirtualBox**
   - **Ubuntu**
   - **Docker**
   - VScode
   - Teraterm 
   - Git
   - GitHub Action
   - Flyway
   - Nginx

## 구성

1. 기능
    1. 게시글
        - *게시글 작성*
        - *카테고리 선택*
        - *이미지 첨부*
    2. 댓글
        - *게시글 댓글 작성*
        - *댓글 답글 작성*
    3. 좋아요 기능
        - *게시글 좋아요*
        - *댓글 좋아요*
        - *좋아요 활동 표시*
    5. 로그인, 회원가입
        - *일반 회원가입 제공*
        - *소셜 로그인, 회원가입 제공*
    6. 검색
        - *댓글 내용 검색*
        - *게시글 내용 검색*
    7. 신고 기능
        - *신고 리스트 업 ( 관리자 )*
        - *신고 기능*
    8. 권한 
        - *관리자 생성*
        - *커뮤니티 관리 내역 기록*
    9. 북마크
        - *게시글 북마크*
        - *북마크 리스트*
    10. 유저 정보 관리
        - *닉네임 변경*
        - *비밀번호 변경*
        - *소셜 연동 해제, 새 등록*
    11. 유저 활동 기록
        - *유저 게시글 작성 기록*
        - *유저 활동 기록 ( 댓글, 좋아요, 북마크 )*


2. 설계
    1. 유스케이스
         ![UML](https://github.com/user-attachments/assets/ceba2ab5-0d16-4614-91fd-b155cf7fba3d)
    
    2. API 명세서

        [명세서 세부 정리](https://www.notion.so/API-1061a3736ea5803ba903f2b3643bf39a?source=copy_link)
         
    1. 아키텍처
       - 서버 구조
         ![구상도](https://github.com/user-attachments/assets/f6f23a1f-9a37-4aee-b503-93619b302d37) 

    2. MySql
       - `RAW SQL` 방식 
       - ERD
          ![Image](https://github.com/user-attachments/assets/55a105ff-5541-40cd-a543-2440bd7c079e)
    
    3. Redis
       - 세션 데이터 유지를 위한, `TTL` 설정
       - 서버 확장성을 고려한, 유저 세션 관리 가능
           - 다른 `세션쿠키` 에서 로그인 할 경우, 중복 로그인 방지를 위해, 세션 삭제 처리
       - 요청 데이터, `캐싱` 전략 이용

    4. Docker
       - Dockerfile을 이용한, 웹 서비스 이미지화
       - `Mysql`, `Redis`, `웹 서비스`를 docker-compose를 이용해, 통합 관리
       - `GitHub Action` 을 이용한, `Docker image` 자동 빌드
    
    5. CI/CD
        - GitHub Action 
           - 배포를 위한 Docker Hub Image Push
           - PROD 환경, SSH 접속을 통한 배포
               - Docker Hub Image 배포
           - PROD 환경 제어
               - docker-compose.yml 작성
               - 환경변수 파일 작성
               - 서버 환경에 맞추어, 유동적으로 서버 설정을 바꿀 수 있도록 구현
   6. flyway
      - 발생하는 DB 마이그레이션 내역을 기록

