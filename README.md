# Community_Web

기준 12.19.2024

1. 개요
    - CRUD 학습을 위한 인터넷 커뮤니티 웹 서비스 개발 
    - 백엔드에서 사용되는 프레임워크, 도구 실습

2. 구성
    1. 커뮤니티 웹 어플리케이션
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
    2. MySql
        - ERD &nbsp;
       ![image](https://github.com/user-attachments/assets/82cd2b88-5657-466c-a4f9-74e5e0ead8be)

    3. Redis
       - 세션 데이터 유지를 위한, `TTL` 설정
       - 다른 `세션 쿠키`에서 로그인 할 시, 중복 로그인 방지를 위해, 세션 삭제 처리
    4. Docker
       - Dockerfile을 이용한, 웹 서비스 이미지화
       - Mysql, Redis, 웹 서비스를 docker-compose를 이용해, 통합 관리
       - GitHub Action 을 이용한, main 브런치 웹 서비스 자동 빌드

