"use client"

import { useState } from "react"
import { assets, dummyUserData, ownerMenuLinks } from "../../../assets/assets"
import { NavLink, useLocation } from "react-router-dom"
import "./sidebar.css"

const Sidebar = () => {
  const user = dummyUserData
  const location = useLocation()
  const [image, setImage] = useState("")

  const updateImage = async () => {
    user.image = URL.createObjectURL(image)
    setImage("")
  }

  return (
    <div className="futuristic-sidebar relative min-h-screen md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-solid border-r-[1px] border-r-gray-800 border-t-0 border-l-0 border-b-0 text-sm">
      <div className="sidebar-bg-overlay"></div>
      <div className="sidebar-grid-pattern"></div>

      <div className="profile-section group relative">
        <label htmlFor="image">
          <div className="profile-image-container">
            <img
              src={image ? URL.createObjectURL(image) : user?.image || "#"}
              alt=""
              className="profile-image h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto"
            />
            <div className="profile-ring"></div>
          </div>

          <div className="profile-edit-overlay absolute hidden top-0 right-0 left-0 bottom-0 bg-black/20 backdrop-blur-sm rounded-full group-hover:flex items-center justify-center cursor-pointer transition-all duration-300">
            <img src={assets.edit_icon || "/placeholder.svg"} alt="" className="edit-icon" />
          </div>
          <input type="file" id="image" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0])} />
        </label>
      </div>

      {image && (
        /* Futuristic save button with glass morphism */
        <button className="save-button absolute top-0 right-0 flex p-2 gap-1 bg-white/10 backdrop-blur-md text-white cursor-pointer rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
          Save <img src={assets.check_icon || "/placeholder.svg"} width={13} alt="" onClick={updateImage} />
        </button>
      )}

      <p className="user-name mt-4 text-base max-md:hidden text-white font-medium">{user?.name}</p>

      <div className="navigation-container w-full mt-6">
        {ownerMenuLinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            className={`nav-link relative flex items-center gap-3 w-full py-4 pl-6 transition-all duration-300 ${
              link.path === location.pathname
                ? "nav-link-active bg-white/10 text-white border-r-2 border-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="nav-icon-container">
              <img
                src={link.path === location.pathname ? link.coloredIcon : link.icon}
                alt="nav-icon"
                className="w-5 h-5 transition-transform duration-300"
              />
            </div>
            <span className="nav-text max-md:hidden font-medium">{link.name}</span>

            <div
              className={`nav-indicator absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-l-full transition-all duration-300 ${
                link.path === location.pathname ? "bg-white shadow-lg shadow-white/50" : "bg-transparent"
              }`}
            ></div>

            <div className="nav-glow absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
