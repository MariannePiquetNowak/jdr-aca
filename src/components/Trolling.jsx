import trollVideo from "../assets/video/Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster).mp4"

const Trolling = () => {
  return (
    <div className="video-troll hide">
        <video controls width="500" autoplay="true">
            {/* ${process.env.REACT_APP_BASE_URL_API}/video => accès api*/}
            <source src={trollVideo} type="video/mp4" />
        </video>
    </div>
  )
}

export default Trolling
