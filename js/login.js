/* 
const elHead = document.querySelector('body')
const createScript = document.createElement('script');
createScript.src = './js/login.js';
elHead.append(createScript);
*/
document.addEventListener("DOMContentLoaded", () => { 
// 로그인+회원가입 공통
// 로그인
// 회원가입
// 회원가입 완료
    /* 
    // 비밀번호 패턴검사 정규식
    let pwChecker = (pw) => {
        //정규식 조건: 영문소문자/숫자/특문 조합 8~15자
        const pwPattern = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[a-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,15}$/;
        //비번 추가조건1: 연속 3개 이상의 문자/숫자/특문이 오지 않도록
        const pwAdditional1 = /(.)\1{2,}/;
        //비번 추가조건2: 아이디와 4글자 이상 겹치지 않도록
        // const pwAdditional2 = id.substring();

        //비밀번호 패턴 검증
        if(!pwPattern.test(pw)){
            return false;
        } else if(pwAdditional1.test(pw)){ //추가조건1
            return false;    
        // }
        // else if(pwAdditional2.test(pw)){  //추가조건2
        //     return false;
        }else{
            return true;
        }
    }
    */
})

// [↓] sns 로그인

//로그인 여부 판별: 쿠키에 access_token값 있는지?
// let cookie = document.cookie.split(';');    //쿠키에서
// let access_token = cookie.filter((v)=>v.match('access_token')); //엑세스 토큰 추출
// 엑세스 토큰이 있으면 로그인 페이지 진입불가, 메인으로 이동

let cookie = document.cookie.split(';');    //쿠키에서
let access_token= cookie.filter((v)=>v.match('access_token')); //엑세스 토큰 추출
var login = false; //로그인 상태일 때:true , 로그아웃 상태일 때: false
if(access_token.length && access_token[0].split('=')[1]){ //엑세스 토큰 값있
    login = true;
    location.href="/";
} else{                         //엑세스 토큰 값없: 로그인 진행

/* sns 로그인 공통 변수, 함수*/
//(1) 서비스 주소(로그인 버튼 있는 페이지)
const SERVICE_URI = "http://127.0.0.1:5501/login.html";
//(2) 콜백할 주소(리디렉트)
const REDIRECT_URI = "http://127.0.0.1:5501/login.html";
//(3) 콜백 후 이동할 주소(메인)
const AFTER_REDIRECT_URI = "http://127.0.0.1:5501/";
//(4) 유저 정보 구조
var profile =  {
    nickname: '',
    email: '',
    name:'',
    age: '',
    b_day: '',
    gender: '',
    mobile: '',
    id: ''
};
//(5) 쿠키(+세션)에 저장하는 함수
const setCookie = function(accessToken) {
    //1. 유효기간 설정
    let endDate = new Date();
    endDate.setSeconds(endDate.getSeconds() + 86400);   //24시간 (단위:초)
    //2. 유저 정보를 쿠키에 저장
    Object.entries(profile).forEach(([key, value]) => {
        document.cookie = `${key}=${value}; expires=${endDate.toGMTString()};`;
    })
    //3. 엑세스 토큰을 쿠키에 저장
    document.cookie = `access_token=${accessToken}; expires=${endDate.toGMTString()};`
    //3-1. 정보를 세션에 저장(로그인 페이지 외 다른 페이지에서도 사용할 수 있게)
        //1) 프로필 정보
    sessionStorage.profile = JSON.stringify(profile);
        //2) 로그인 여부
    login = true;
    sessionStorage.login = JSON.stringify(login);
        /* <참고> 세션에 저장한 정보 꺼내쓸 때 : 
              let checkLogin = JSON.parse(sessionStorage.login); 
              console.log(checkLogin);  //true면 로그인, false면 로그아웃 상태
              이런 방법으로 사용  */
        /* 로그아웃 시 sessionStorage.clear() 반드시 해주기!!! */
    //4. 메인 페이지로 이동
    location.href = AFTER_REDIRECT_URI;
}

/* 카카오 */
const kakaoLogin = function(){
    const REST_API_KEY = "b87b0bf5c70402fe02aec9e63d71cf0a";
    let AUTHORIZE_CODE_KAKAO = new URLSearchParams(location.search),  //인가코드는 매번 랜덤하게 바뀜
        ACCESS_TOKEN_KAKAO = "";
    const kakao = document.querySelector('.kakao'); //로그인 버튼

    // 1. 인가코드 받기(주소창에 파라미터(?code=형태)로 들어옴) //login.js
    function loginWithKakao() {
        Kakao.Auth.authorize({
            redirectUri: REDIRECT_URI
        });
        // console.log(AUTHORIZE_CODE_KAKAO);   //인가 코드 확인하기
    }
    kakao.addEventListener('click',loginWithKakao);


    // 2. 액세스 토큰 발급(인가코드 있어야 발급 가능)   //common.js(로그인 성공 후 메인으로 이동, 다른 페이지에서 로그인 정보 계속 사용)
    function displayToken() {
        //액세스 토큰(ACCESS_TOKEN_KAKAO = 주소창의?code=)가져오기
        if(AUTHORIZE_CODE_KAKAO.get('code')){ //인가 코드가 있을 때 실행
            fetch("https://kauth.kakao.com/oauth/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `grant_type=authorization_code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&code=${AUTHORIZE_CODE_KAKAO.get('code')}`
            })
            .then(res => res.json())
            .then(res => {
                ACCESS_TOKEN_KAKAO = res.access_token;  //엑세스 토큰값 저장
                Kakao.Auth.setAccessToken(ACCESS_TOKEN_KAKAO);
                userInfoFunc(); //3. 사용자 정보 받기 실행
            })
        }
    }
    displayToken();

    //3. 사용자 정보 받기   //common.js(다른 페이지에서 로그인 정보 계속 사용)
    function userInfoFunc(){
        fetch("https://kapi.kakao.com/v2/user/me", {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN_KAKAO}`
            }
        })
        .then(res => res.json())
        .then(res => {
            //유저 정보 저장
            profile.nickname = res.properties.nickname;
            //쿠키에 저장
            setCookie(ACCESS_TOKEN_KAKAO);
        })
    }
    

    //4. 로그아웃   //common.js(다른 페이지에서 로그인 정보 계속 사용)
    function kakaoLogout() {
        Kakao.Auth.logout() //카카오 로그아웃 함수 호출
        .then(function() {
            alert('logout ok\naccess token -> ' + Kakao.Auth.getAccessToken());
            // deleteCookie();
            document.cookie = `access_token=;expires=;`;
            alert('로그아웃 성공');
        })
        .catch(function() {
            alert('로그인하지 않았습니다.');
        });
    }
    //로그아웃 버튼 클릭 시 4번 호출
    // const elLogoutBtn = document.querySelector('.?');
    // elLogoutBtn.addEventListener('click', kakaoLogout);
}
kakaoLogin()

/* 네이버 : 네이버는 함수안에 넣으면 스코프 이슈 발생, 못넣음*/
const CLIENT_ID = "cEjPiQLxtraGtftdtKot",
        CLIENT_SECRET = "sXx4SV6rmO",
        CALLBACK_URI = SERVICE_URI;
        // 네이버가 콜백주소 url에 엑세스 토큰값을 보내기 때문에, 로그인 성공 시 바로 메인페이지로 이동하지 않습니다.
        // 일단 다시 로그인 페이지로 다시 돌아온 후 받아온 토큰값과 회원정보를 저장하고, 이후에 메인으로 이동합니다.
var naver_id_login = new naver_id_login(CLIENT_ID, CALLBACK_URI);
var state = naver_id_login.getUniqState();
let ACCESS_TOKEN_NAVER = naver_id_login.getAccessToken();

const naver = document.querySelector('.naver'); //로그인버튼

/* 네이버 로그인 초기화 Script */
// 1. 인가코드 받기: 네이버는 인가코드 필요 없나..?
// 2. 액세스 토큰 발급 (주소창에 access_token=형태로 들어옴)
const loginWithNaver = function() {
    location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URI}&state=`;
}
/* 네이버 로그인 Callback페이지 처리 Script */
naver_id_login.get_naver_userprofile("naverSignInCallback()");
// 네이버 사용자 프로필 조회 이후 프로필 정보를 처리할 callback function
function naverSignInCallback() {
    //유저 정보 저장
    Object.keys(profile).forEach(key => {
        profile[key] = naver_id_login.getProfileData(key);
    })
    //쿠키에 저장
    setCookie(ACCESS_TOKEN_NAVER);
}

naver.addEventListener('click', function(){
    loginWithNaver();
})

/* 구글 */

}