# Slack-Clone
<img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=white"/><img src="https://img.shields.io/badge/Redux-764ABC?style=flat-square&logo=Redux&logoColor=white"/><img src="https://img.shields.io/badge/React Router-CA4245?style=flat-square&logo=ReactRouter&logoColor=white"/><img src="https://img.shields.io/badge/Mui-007FFF?style=flat-square&logo=Mui&logoColor=white"/><img src="https://img.shields.io/badge/Gravatar-1E8CBE?style=flat-square&logo=Gravatar&logoColor=white"/><img src="https://img.shields.io/badge/Emotion-F01F7A?style=flat-square&logo=Emotion&logoColor=white"/><img src="https://img.shields.io/badge/Colorful-5FCF80?style=flat-square&logo=Colorful&logoColor=white"/><img src="https://img.shields.io/badge/Dayjs-FF3008?style=flat-square&logo=Dayjs&logoColor=white"/><img src="https://img.shields.io/badge/EmojiMart-FAB040?style=flat-square&logo=EmojiMart&logoColor=white"/>

![image](https://user-images.githubusercontent.com/58839497/218242127-96dbf081-53c6-429d-be2f-86f27b8ebf27.png)

## 회원가입
### Firebase
파이어 베이스(https://console.firebase.google.com) 로 회원가입 기능 구현
```jsx
const postUserData = useCallback(async(name, email, password) => {
  setLoading(true)
  
  try {
    const { user } = await createUserWithEmailAndPassword(getAuth(), email, password)
    await updateProfile(user, {
      displayName: name,
      photoURL: `https://www.gravatar.com/avatar/${md5(email)}?d=retro`
    })
    await set(ref(getDatabase(), 'users/' + user.uid), {
      name: user.displayName,
      avatar: user.photoURL
    })
    dispatch(setUser(user))
  } catch(e) {
    setError(e.message)
    setLoading(false)
  }
}, [dispatch])
```
- `createUserWithEmailAndPassword` : 회원 가입과 동시에 로그인
- `getAuth` : 인증 정보 가져오는 것

#### 닉네임/이메일/비밀번호 (8자 이상 문자, 숫자, 기호 사용 가능)
#### 로딩 기능
#### Error - 💣

<br />

## 로그인/로그아웃

#### User Store 구현
```jsx
const SET_USER = "SET_USER";
const CLEAR_USER = "CLEAR_USER";

export const setUser = (user) => ({ type: SET_USER, currentUser: user });
export const clearUser = () => ({ type: CLEAR_USER });

const initialState = {
  currentUser: null,
  isLoading: true,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        currentUser: action.currentUser,
        isLoading: false,
      };
    case CLEAR_USER:
      return {
        currentUser: null,
        isLoading: false,
      };
    default:
      return state;
  }
};

export default userReducer;
```

#### 인증 상태 체크
```jsx
const dispatch = useDispatch()
const {isLoading, currentUser} = useSelector((state) => state.user)

useEffect(() => {
  const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
    if(!!user) {
      dispatch(setUser(user));
    } else {
      dispatch(clearUser())
    }
  })
  return () => unsubscribe()
},[dispatch])
```

#### Reducer 관리
```jsx
const rootReducer = combineReducers({
    user: userReducer,
    channel: channelReducer,
    theme: themeReducer,
})
```
- 유저, 채널, 테마 3가지의 reducer를 사용할건데 `reducer`가 여러 개일 경우 하나로 묶어 줄 수 있는 `combineReducers`를 사용한다.

#### 로그아웃
```jsx
const handleLogout = useCallback(async () => {
  await signOut(getAuth());
}, []);
```
- `signOut` : getAuth를 통해서 인증정보를 가져와서 로그아웃 (firebase의 함수)

#### 로그인
```jsx
const loginUser = useCallback(async(email, password) => {
  setLoading(true)
  try {
    await signInWithEmailAndPassword(getAuth(), email, password)
  } catch(e) {
    setError(e.message)
    setLoading(false)
  }
}, [])
```
- `signInWithEmailAndPassword` : 기존 사용자가 자신의 이메일 주소와 비밀번호를 사용해 로그인 (firebase의 함수)
<br />

## 채널
#### 채널 생성 버튼 활성화
채널 data를 firebase에 연결
```jsx
const handleSubmit = useCallback(async () => {
  const db = getDatabase();
  const key = push(child(ref(db), 'chennels')).key;
  const newChannel = {
    id: key,
    name: channelName,
    details: channelDetail
  }
  const updates = {}
  updates['/channels/'+key] = newChannel
  try {
    await update(ref(db), updates)
    setChannelName('')
    setChannelDetail('')
    handleClose()
  } catch (error) {
    console.error(error)
  }
}, [channelDetail, channelName, handleClose])
```
등록한 data 읽어오기
```jsx
const [channels, setChannels] = useState([])

useEffect(() => {
  const unsubscribe = onChildAdded(ref(getDatabase(), 'channels'), (snapshot) => {
    setChannels((channelArr) => [...channelArr, snapshot.val()])
  })
  return () => {
    setChannels([])
    unsubscribe()
  }
}, [])
```
- `onChildAdded()` : 리스트의 아이템을 검색하거나 추가가 있을 때 수신합니다.
- `snapshot` : firebase에서 snapshot은 database에 대한 변화를 관찰하고 있다. snapshot의 기본적인 작동은 js의 eventlistener와 비슷합니다. 즉 계속 db를 보고 있기 때문에 component가 unmount되었을 때 이를 해제해주어야 합니다.
#### 채널 store 생성
```jsx
const SET_CURRENT_CHANNEL = 'SET_CURRENT_CHANNEL'
export const setCurrentChannel = (channel) => ({type: SET_CURRENT_CHANNEL, currentChannel: channel})
const initialState = {currentChannel: null}

const channelReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_CHANNEL:
      return {
        currentChannel: action.currentChannel
      }
    default:
      return state;
    }
}
export default channelReducer
```
<br />

## 채팅
#### 채팅 메시지 전송 기능
firebase 연동
```jsx
const {channel, user} = useSelector(state => state);

const clickSendMessage = useCallback(async () => {
  if(!message) return
  setLoading(true)
  try {
    await set(push(ref(getDatabase(), 'messages/' + channel.currentChannel.id)),createMessage());
    setLoading(false)
    setMessage('')
  } catch (error) {
    console.error(error)
    setLoading(false)
  }
}, [message, createMessage, channel.currentChannel?.id])
```
저장되어 있는 메시지(data) 불러오기
```jsx
useEffect(() => {
    if(!channel.currentChannel) return;
    async function getMessages() {
      const snapShot = await get(child(ref(getDatabase()),'messages/' + channel.currentChannel.id))
      setMessages(snapShot.val() ? Object.values(snapShot.val()) : [])
    }
    getMessages();
    return () => {
      setMessages([])
    }
}, [channel.currentChannel])
```
현재 시점 이후로 오는 메시지 캐치하기
```jsx
useEffect(() => {
  if(!channel.currentChannel) return;
  const sorted = query(ref(getDatabase(), 'messages/' + channel.currentChannel.id), orderByChild('timestamp'));
  const unsubscribe = onChildAdded(
    query(sorted, startAt(Date.now())),
    (snapshot)  => setMessages((oldMessages) => [...oldMessages, snapshot.val()])
  );
  return () => {
    unsubscribe?.();
  }
}, [channel.currentChannel])
```
- 프로필 이미지 (https://ko.gravatar.com/)
- 이모티콘 (https://missiveapp.com/open/emoji-mart)
- 이미지 첨부
<br />

## 테마 설정
- 테마 색상 변경

<br />

## 프로필
- 이미지 생성/변경 (이미지 크롭, 저장) 

<br />

PC에 최적화 된 웹 사이트 입니다. (반응형 준비중)
