declare global {
  interface Window {
    Kakao: any
  }
}

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY as string | undefined

let initialized = false

function init() {
  if (initialized || !KAKAO_APP_KEY || !window.Kakao) return
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_APP_KEY)
  }
  initialized = true
}

export function useKakaoShare() {
  const isAvailable = !!KAKAO_APP_KEY && !!window.Kakao

  function shareLink(options: {
    title: string
    description: string
    url: string
    imageUrl?: string
  }) {
    init()
    if (!window.Kakao?.Share) return false

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: options.title,
        description: options.description,
        imageUrl: options.imageUrl || `${window.location.origin}/icons/icon-512.png`,
        link: {
          mobileWebUrl: options.url,
          webUrl: options.url
        }
      },
      buttons: [
        {
          title: '참여하기',
          link: {
            mobileWebUrl: options.url,
            webUrl: options.url
          }
        }
      ]
    })
    return true
  }

  return { isAvailable, shareLink }
}
