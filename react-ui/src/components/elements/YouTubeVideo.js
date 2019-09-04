import React from "react"
import useWindowDimensions from '../hooks/useWindowDimensions'

const YouTubeVideo = ({ start=0, id }) => {
  const { containerWidth } = useWindowDimensions()
  let width = containerWidth - 50
  let height = Math.round(width * 0.5625)
  return (
    <iframe
      title="youtube"
      width={width}
      height={height}
      src={`https://www.youtube-nocookie.com/embed/${id}?start=${start}`}
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen="allowfullscreen"
      mozallowfullscreen="mozallowfullscreen" 
      msallowfullscreen="msallowfullscreen" 
      oallowfullscreen="oallowfullscreen" 
      webkitallowfullscreen="webkitallowfullscreen"
    ></iframe>
  )
}

export default YouTubeVideo
