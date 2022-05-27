import '../scss/main.scss'

// Refs
const $refs = {
  searchForm: document.querySelector('.searchForm'),
  search: document.querySelector('.searchBar'),
  searchBtn: document.querySelector('.searchBtn'),
  credits: document.querySelector('.credits'),
  movies: document.querySelector('.movies'),
  movieList: document.querySelector('.movieList'),
  message: document.querySelector('.message'),
  observer: document.querySelector('.observer'),
  loader1: document.querySelector('.loader_1'),
  loader2: document.querySelector('.loader_2')
}

// State
const $state = {
  title: '',
  page: 1,
  movies: [],
  totalResults: 0,
}

// 검색창 입력시 함수 실행
$refs.searchForm.addEventListener('submit', async e => {
  e.preventDefault()
  searchMovies(true)
})

// 검색한 영화 정보 출력
async function searchMovies(isFirst) {

  if (isFirst) {

    $state.page = 1
    $state.movies = []
    $state.title = $refs.search.value

    renderMovies([], isFirst)
  }

  try {
    const results = await getMovies($state.title, $state.page)
    const { Search, totalResults } = results

    $refs.message.innerHTML = `검색하신 [ ${$state.title} ] 의 영화 정보 '${$state.totalResults}' 건을 찾았습니다.`
    $state.movies.push(...Search)
    $state.totalResults = Number(totalResults)
    $state.page += 1

    renderMovies(Search, isFirst)
    observerBox(false)

    setTimeout(() => {
      observerBox(true)
    }, 1500)
  }

  catch (error) {
    console.log('searchMovies() Error:', error)

    $refs.loader2.style.display = 'none'
    $refs.message.innerHTML = `검색하신 [ ${$state.title} ] 의 영화 정보를 찾을 수 없습니다.`
    $refs.search.value = ''

    observerBox(false)
  }
}

// observerBox
function observerBox() {
  const moreMovies = $state.totalResults > $state.movies.length

  if (moreMovies) {
    $refs.observer.classList.add('show')
    return
  }
  $refs.observer.classList.remove('show')
}

// observe
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      searchMovies()
    }
  })
})
io.observe($refs.observer)


// OMDbAPI 서버에서 영화 목록 가져오기
async function getMovies(title, page) {
  const key = '7035c60c';
  const { data } = await axios ({
    url: `https://www.omdbapi.com?apikey=${key}&s=${title}&page=${page}`
  })
  return data
}

// 가져온 영화정보 rendering
function renderMovies(res = [], isFirst) {
  const movieEls = []

  res.forEach( movie => {

    const movieEl = document.createElement('li')
    movieEl.classList.add("movieEl")
    const posterEl = document.createElement('div')
    posterEl.classList.add('poster')

    if (movie.Poster === 'N/A') {
      posterEl.classList.add('no_Img')
    } else {
      posterEl.style.backgroundImage = `url(${movie.Poster})`
    }
    
    movieEl.innerHTML = `
      <div class="aboutMovie">
        <div class="title">${ movie.Title }</div>
        <div class="year">[${movie.Year}]</div>
      </div>
    `
    movieEl.append(posterEl)
    movieEls.push(movieEl)
  })

  if (isFirst) {
    $refs.movieList.innerHTML = ''
    $refs.movieList.style.display = 'none'
    $refs.movies.style.display = 'none'
    $refs.credits.style.display = 'none'
    $refs.loader1.style.display = 'flex'
    $refs.loader2.style.display = 'none'
  }
  
  setTimeout(() => {

    $refs.loader1.style.display = 'none'
    $refs.movies.style.display = 'flex'
    $refs.movieList.style.display = 'flex'

    if ($state.totalResults === $state.movies.length) {
      $refs.loader2.style.display = 'none'
      $refs.search.value = ''
    }
    else {
      $refs.loader2.style.display = 'inline-block'
    }

    $refs.movieList.append(...movieEls)
  },1500)
}



