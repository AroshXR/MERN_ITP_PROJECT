import logo from "./logo.png";
import gmail_logo from "./gmail_logo.svg";
import facebook_logo from "./facebook_logo.svg";
import instagram_logo from "./instagram_logo.svg";
import twitter_logo from "./twitter_logo.svg";
import menu_icon from "./menu_icon.svg";
import search_icon from "./search_icon.svg"
import close_icon from "./close_icon.svg"
import users_icon from "./users_icon.svg"
import material_icon from "./material_icon.jpg"
import location_icon from "./location_icon.svg"
import color_icon from "./color_icon.jpg"
import addIcon from "./addIcon.svg"
import shirt_icon from "./shirt_icon.jpg"
import shirtIconColored from "./shirtIconColored.jpg"
import dashboardIcon from "./dashboardIcon.svg"
import dashboardIconColored from "./dashboardIconColored.svg"
import addIconColored from "./addIconColored.svg"
import listIcon from "./listIcon.svg"
import listIconColored from "./listIconColored.svg"
import cautionIconColored from "./cautionIconColored.svg"
import arrow_icon from "./arrow_icon.svg"
import star_icon from "./star_icon.svg"
import check_icon from "./check_icon.svg"
import tick_icon from "./tick_icon.svg"
import delete_icon from "./delete_icon.svg"
import eye_icon from "./eye_icon.svg"
import eye_close_icon from "./eye_close_icon.svg"
import filter_icon from "./filter_icon.svg"
import edit_icon from "./edit_icon.svg"
import calendar_icon_colored from "./calendar_icon_colored.svg"
import location_icon_colored from "./location_icon_colored.svg"
import testimonial_image_1 from "./testimonial_image_1.png"
import testimonial_image_2 from "./testimonial_image_2.png"
import main_homepage from "./main_homepage.png"
import banner_wedding_image2 from "./banner_wedding_image2.jpg"
import user_profile from "./user_profile.png"
import upload_icon from "./upload_icon.svg"
import outfit_image1 from "./outfit_image1.png"
import outfit_image2 from "./outfit_image2.png"
import outfit_image3 from "./outfit_image3.png"
import outfit_image4 from "./outfit_image4.png"
import dress1_2 from "./dress1_2.WEBP"
import dress1_3 from "./dress1_3.WEBP"
import dress1_4 from "./dress1_4.WEBP"

export const cityList = ['All Ctegories','Party Dresses & Suits', 'Evening Gowns', 'Cocktail Dresses', 'Wedding & Bridal Wear','Men’s Tuxedos & Suits']

export const assets = {
    logo,
    gmail_logo,
    facebook_logo,
    instagram_logo,
    twitter_logo,
    menu_icon,
    search_icon,
    close_icon,
    users_icon,
    edit_icon,
    material_icon,
    location_icon,
    color_icon,
    addIcon,
    shirt_icon,
    shirtIconColored,
    dashboardIcon,
    dashboardIconColored,
    addIconColored,
    listIcon,
    listIconColored,
    cautionIconColored,
    calendar_icon_colored,
    location_icon_colored,
    arrow_icon,
    star_icon,
    check_icon,
    tick_icon,
    delete_icon,
    eye_icon,
    eye_close_icon,
    filter_icon,
    testimonial_image_1,
    testimonial_image_2,
    main_homepage,
    banner_wedding_image2,
    outfit_image1,
    upload_icon,
    user_profile,
    outfit_image2,
    outfit_image3,
    outfit_image4,
    dress1_2,
    dress1_3,
    dress1_4
}

export const menuLinks = [
    { name: "Home", path: "/" },
    { name: "Outfits", path: "/Outfits" },
    { name: "My Bookings", path: "/my-bookings" },
]

export const ownerMenuLinks = [
    { name: "Dashboard", path: "/owner", icon: dashboardIcon, coloredIcon: dashboardIconColored },
    { name: "Add Outfit", path: "/owner/add-outfit", icon: addIcon, coloredIcon: addIconColored },
    { name: "Manage Outfits", path: "/owner/manage-outfits", icon: shirt_icon, coloredIcon: shirtIconColored },
    { name: "Manage Bookings", path: "/owner/manage-bookings", icon: listIcon, coloredIcon: listIconColored },
]

export const dummyUserData = {
  "_id": "6847f7cab3d8daecdb517095",
  "name": "GreatStack",
  "email": "admin@example.com",
  "role": "owner",
  "image": user_profile,
}

export const dummyOutfitData = [
    {
        "_id": "82fc8b5d9a0a2c3b4b79d5e7",
        "owner": "55be9d8a8a2a4f9f9a12458b",
        "brand": "Luxe ",
        "model": "Glamorous Evening Gown",
        "image": outfit_image1,
        "condition": "New",
        "category": "Evening Wear",
        "size": "S , M",
        "color": "Olive Green",
        "material": "Satin",
        "pricePerDay": 120,
        "location": "Colombo , Gampaha",
        "description": "This exquisite emerald green gown is perfect for any glamorous evening event. Featuring a sleek satin fabric, it offers both elegance and comfort. Ideal for galas, weddings, or high-profile parties.",
        "isAvailable": true,
        "createdAt": "2025-09-02T10:40:56.215Z",
    },
    {
       "_id": "82fc8b5d9a0a2c3b4b79d5e8",
        "owner": "55be9d8a8a2a4f9f9a12458b",
        "brand": "Vera Wang",
        "model": "Royal Elegance Gown",
        "image": outfit_image2,
        "condition": "2023",
        "category": "Evening Wear",
        "size": "L",
        "color": "Royal Blue",
        "material": "Silk",
        "pricePerDay": 150,
        "location": "Colombo",
        "description": "A luxurious royal blue gown by Vera Wang, made from the finest silk. Perfect for galas, weddings, and sophisticated evening events. The gown features intricate lace detailing and a flattering A-line silhouette.",
        "isAvailable": true,
        "createdAt": "2025-09-02T10:40:56.215Z",
    },
    {
         "_id": "82fc8b5d9a0a2c3b4b79d5e9",
        "owner": "55be9d8a8a2a4f9f9a12458b",
        "brand": "Chanel",
        "model": "Black Tie Dress",
        "image": outfit_image3,
        "condition": "2022",
        "category": "Cocktail Dress",
        "size": "M",
        "color": "Black",
        "material": "Lace",
        "pricePerDay": 120,
        "location": "Los Angeles",
        "description": "Chanel's iconic black lace cocktail dress, perfect for upscale events and black-tie affairs. This dress features a sleek silhouette with delicate lacework, designed to exude elegance and class.",
        "isAvailable": true,
        "createdAt": "2025-09-02T10:41:12.215Z",
    },
    {
         "_id": "82fc8b5d9a0a2c3b4b79d5f0",
        "owner": "55be9d8a8a2a4f9f9a12458b",
        "brand": "Oscar ",
        "model": "Glamorous Red Carpet Dress",
        "image": outfit_image4,
        "condition": "2023",
        "category": "Red Carpet",
        "size": "S",
        "color": "Crimson Red",
        "material": "Velvet",
        "pricePerDay": 250,
        "location": "Miami",
        "description": "An exquisite crimson red velvet gown by Oscar de la Renta, designed for high-profile events. The dress features luxurious velvet fabric, intricate beadwork, and a flattering off-shoulder neckline, ideal for red carpet occasions.",
        "isAvailable": true,
        "createdAt": "2025-09-02T10:41:40.215Z",
    }
];

export const dummyMyBookingsData = [
    {
        "_id": "68482bcc98eb9722b7751f70",
        "outfit": dummyOutfitData[0],
        "user": "6847f7cab3d8daecdb517095",
        "owner": "6847f7cab3d8daecdb517095",
        "reservationDate": "2025-06-13T00:00:00.000Z",
        "returnDate": "2025-06-14T00:00:00.000Z",
        "status": "confirmed",
        "price": 440,
        "createdAt": "2025-06-10T12:57:48.244Z",
    },
    {
        "_id": "68482bb598eb9722b7751f60",
        "outfit": dummyOutfitData[1],
        "user": "6847f7cab3d8daecdb517095",
        "owner": "67fe3467ed8a8fe17d0ba6e2",
        "reservationDate": "2025-06-12T00:00:00.000Z",
        "returnDate": "2025-06-12T00:00:00.000Z",
        "status": "pending",
        "price": 130,
        "createdAt": "2025-06-10T12:57:25.613Z",
    },
    {
        "_id": "684800fa0fb481c5cfd92e56",
        "outfit": dummyOutfitData[2],
        "user": "6847f7cab3d8daecdb517095",
        "owner": "67fe3467ed8a8fe17d0ba6e2",
        "reservationDate": "2025-06-11T00:00:00.000Z",
        "returnDate": "2025-06-12T00:00:00.000Z",
        "status": "pending",
        "price": 600,
        "createdAt": "2025-06-10T09:55:06.379Z",
    },
    {
        "_id": "6847fe790fb481c5cfd92d94",
        "outfit": dummyOutfitData[3],
        "user": "6847f7cab3d8daecdb517095",
        "owner": "6847f7cab3d8daecdb517095",
        "reservationDate": "2025-06-11T00:00:00.000Z",
        "returnDate": "2025-06-12T00:00:00.000Z",
        "status": "confirmed",
        "price": 440,
        "createdAt": "2025-06-10T09:44:25.410Z",
    }
]

export const dummyDashboardData = {
    "totalOutfits": 4,
    "totalBookings": 2,
    "pendingBookings": 0,
    "completedBookings": 2,
    "recentBookings": [
        dummyMyBookingsData[0],
        dummyMyBookingsData[1]
    ],
    "monthlyRevenue": 840
}