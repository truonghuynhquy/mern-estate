import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import PropTypes from "prop-types"; // Import PropTypes

export default function ListingItem({ listing }) {
  // Ensure offer is treated as a boolean
  const isOffer = Boolean(listing.offer); // Convert to boolean

  // Ensure imageUrls is always an array
  let imageUrls = [];
  if (typeof listing.imageUrls === "string") {
    // If listing.imageUrls is a string, convert it to an array with one element
    imageUrls = [JSON.parse(listing.imageUrls)];
  } else if (Array.isArray(listing.imageUrls)) {
    // If listing.imageUrls is already an array, use it directly
    imageUrls = JSON.parse(listing.imageUrls);
  } else {
    // Fallback to a default image URL if imageUrls is neither string nor array
    imageUrls = [
      "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg",
    ];
  }

  // Ensure there's at least one image URL or provide a fallback
  const imageSrc = imageUrls[0];

  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px]">
      <Link to={`/listing/${listing.id}`}>
        <img
          src={imageSrc}
          alt="listing cover"
          className="h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300"
        />
        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="truncate text-lg font-semibold text-slate-700">
            {listing.name}
          </p>
          <div className="flex items-center gap-1">
            <MdLocationOn className="h-4 w-4 text-green-700" />
            <p className="text-sm text-gray-600 truncate w-full">
              {listing.address}
            </p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {listing.description}
          </p>
          <p className="text-slate-500 mt-2 font-semibold ">
            {isOffer
              ? listing.discountPrice.toLocaleString("en-US")
              : listing.regularPrice.toLocaleString("en-US")}
            {listing.type === "rent" && " / month"}
          </p>
          <div className="text-slate-700 flex gap-4">
            <div className="font-bold text-xs">
              {listing.bedrooms > 1
                ? `${listing.bedrooms} beds `
                : `${listing.bedrooms} bed `}
            </div>
            <div className="font-bold text-xs">
              {listing.bathrooms > 1
                ? `${listing.bathrooms} baths `
                : `${listing.bathrooms} bath `}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// PropTypes validation
ListingItem.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    imageUrls: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string), // Ensure imageUrls is an array of strings
      PropTypes.string, // Handle case where imageUrls is provided as a single string
    ]).isRequired,
    offer: PropTypes.number.isRequired, // Ensure offer is a boolean
    discountPrice: PropTypes.string.isRequired,
    regularPrice: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["rent", "sale"]).isRequired,
    bedrooms: PropTypes.number.isRequired,
    bathrooms: PropTypes.number.isRequired,
  }).isRequired,
};
