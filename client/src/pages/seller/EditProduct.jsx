import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import {
  Upload,
  Tag,
  Info,
  ArrowLeft,
  Trash2,
  Plus,
  Scale,
  Truck,
  Eye,
  TrendingUp,
  Image as ImageIcon,
  X,
  Save,
  Loader,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { axios, fetchProducts, products, systemSettings } = useAppContext();

  // 🟢 FIX: State Declarations moved to the top!
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [files, setFiles] = useState(Array(4).fill(null));
  const [existingImages, setExistingImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hasVariants, setHasVariants] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(""); // 🟢 NEW: Store Rejection Reason

  // 🟢 DYNAMIC CATEGORIES (Now perfectly safe)
  const existingCategories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products],
  );
  const existingSubCategories = useMemo(
    () => [
      ...new Set(
        products
          .filter((p) => p.category === category)
          .map((p) => p.subCategory)
          .filter(Boolean),
      ),
    ],
    [products, category],
  );

  const PLATFORM_FEE_PERCENT = systemSettings?.platformFeePercent || 5;
  const DISCOUNT_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70];

  const UNIT_TYPES = {
    Weight: ["gm", "kg"],
    Volume: ["ml", "L"],
    Count: ["Piece", "Paquet", "boite", "lot", "sachet"],
    area: ["m²", "cm²"],
    puissance: ["w", "kw"],
    longueur: ["m", "cm"],
  };

  const [netIncome, setNetIncome] = useState("");
  const [fakeDiscount, setFakeDiscount] = useState(20);
  const [listingPrice, setListingPrice] = useState("");
  const [fakeMrp, setFakeMrp] = useState("");

  const [simpleWeightValue, setSimpleWeightValue] = useState("");
  const [simpleWeightUnit, setSimpleWeightUnit] = useState("kg");

  const [variants, setVariants] = useState([
    {
      weightValue: "",
      weightUnit: "kg",
      netIncome: "",
      fakeDiscount: 20,
      listingPrice: "",
      fakeMrp: "",
    },
  ]);

  const parseWeight = (str) => {
    if (!str) return { val: "", unit: "kg" };
    const parts = str.split(" ");
    return parts.length === 2
      ? { val: parts[0], unit: parts[1] }
      : { val: str, unit: "kg" };
  };

  const reverseCalc = (listing) => Math.round(listing * 0.95);
  const calcDiscountPerc = (mrp, listing) => {
    if (!mrp || mrp === listing) return 0;
    const perc = Math.round(((mrp - listing) / mrp) * 100);
    return DISCOUNT_OPTIONS.reduce((prev, curr) =>
      Math.abs(curr - perc) < Math.abs(prev - perc) ? curr : prev,
    );
  };

  const calculatePrices = (net, discountPerc) => {
    const netVal = parseFloat(net) || 0;
    const discVal = parseFloat(discountPerc) || 0;
    if (netVal === 0) return { listing: "", mrp: "" };
    const listing = Math.ceil(netVal / ((100 - PLATFORM_FEE_PERCENT) / 100));
    const mrp = Math.ceil(listing / ((100 - discVal) / 100));
    return { listing, mrp };
  };

  useEffect(() => {
    const loadProductData = async () => {
      try {
        const { data } = await axios.post("/api/product/single", { productId });
        if (data.success) {
          const p = data.product;
          setName(p.name);
          setDescription(
            Array.isArray(p.description)
              ? p.description.join("\n")
              : p.description,
          );
          setCategory(p.category || "");
          setSubCategory(p.subCategory || "");
          setExistingImages(p.image || []);
          setRejectionReason(p.rejectionReason || ""); // Store the feedback

          if (p.variants && p.variants.length > 0) {
            const isSimple =
              p.variants.length === 1 &&
              !p.variants[0].weight.includes("Standard Unit") &&
              !p.variants[0].weight.includes("Standard");
            if (
              isSimple ||
              (p.variants.length === 1 &&
                p.variants[0].weight.includes("Standard"))
            ) {
              setHasVariants(false);
              const { val, unit } = parseWeight(
                p.variants[0].weight.includes("Standard")
                  ? "1 kg"
                  : p.variants[0].weight,
              );
              setSimpleWeightValue(val);
              setSimpleWeightUnit(unit);

              setNetIncome(reverseCalc(p.variants[0].offerPrice));
              setFakeDiscount(
                calcDiscountPerc(p.variants[0].price, p.variants[0].offerPrice),
              );
              setListingPrice(p.variants[0].offerPrice);
              setFakeMrp(p.variants[0].price);
            } else {
              setHasVariants(true);
              setVariants(
                p.variants.map((v) => {
                  const { val, unit } = parseWeight(v.weight);
                  return {
                    weightValue: val,
                    weightUnit: unit,
                    netIncome: reverseCalc(v.offerPrice),
                    fakeDiscount: calcDiscountPerc(v.price, v.offerPrice),
                    listingPrice: v.offerPrice,
                    fakeMrp: v.price,
                  };
                }),
              );
            }
          }
        } else {
          navigate("/seller/product-list");
        }
      } catch (error) {
        toast.error("Failed to load product data");
      } finally {
        setIsPageLoading(false);
      }
    };
    loadProductData();
  }, [productId, axios, navigate]);

  useEffect(() => {
    const { listing, mrp } = calculatePrices(netIncome, fakeDiscount);
    setListingPrice(listing);
    setFakeMrp(mrp);
  }, [netIncome, fakeDiscount]);

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    if (field === "netIncome" || field === "fakeDiscount") {
      const { listing, mrp } = calculatePrices(
        updated[index].netIncome,
        updated[index].fakeDiscount,
      );
      updated[index].listingPrice = listing;
      updated[index].fakeMrp = mrp;
    }
    setVariants(updated);
  };

  const addVariant = () =>
    setVariants([
      ...variants,
      {
        weightValue: "",
        weightUnit: "kg",
        netIncome: "",
        fakeDiscount: 20,
        listingPrice: "",
        fakeMrp: "",
      },
    ]);
  const removeVariant = (index) =>
    setVariants(variants.filter((_, i) => i !== index));
  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updated = [...files];
      updated[index] = file;
      setFiles(updated);
    }
  };
  const removeNewImage = (index) => {
    const updated = [...files];
    updated[index] = null;
    setFiles(updated);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      let finalVariants = [];
      if (hasVariants) {
        if (variants.some((v) => !v.netIncome || !v.weightValue)) {
          toast.error("Check variant prices");
          setIsLoading(false);
          return;
        }
        finalVariants = variants.map((v) => ({
          weight: `${v.weightValue} ${v.weightUnit}`,
          price: Number(v.fakeMrp),
          offerPrice: Number(v.listingPrice),
          inStock: true,
        }));
      } else {
        finalVariants = [
          {
            weight: simpleWeightValue
              ? `${simpleWeightValue} ${simpleWeightUnit}`
              : "Standard Unit",
            price: Number(fakeMrp),
            offerPrice: Number(listingPrice),
            inStock: true,
          },
        ];
      }

      // 🟢 Removed bestseller from payload to match AddProduct
      const productData = {
        productId,
        name,
        description: description.split("\n"),
        category,
        subCategory,
        variants: finalVariants,
      };
      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));
      files.forEach((file, i) => {
        if (file) formData.append(`image${i + 1}`, file);
      });

      const { data } = await axios.post("/api/product/update", formData);
      if (data.success) {
        toast.success(data.message);
        fetchProducts();
        navigate("/seller/product-list");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 font-outfit">
      <div
        className="flex items-center gap-2 mb-6 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors w-max font-bold"
        onClick={() => navigate("/seller/product-list")}
      >
        <ArrowLeft size={20} /> Back to Inventory
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Edit Product
        </h1>
        <p className="text-sm text-slate-500">
          Update your product details and pricing.
        </p>
      </div>

      {/* 🟢 NEW: Admin Rejection Alert Banner */}
      {rejectionReason && (
        <div className="mb-8 bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="bg-red-100 p-2 rounded-full shrink-0">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-red-800 font-bold text-lg leading-tight">
              Product Rejected by Admin
            </h3>
            <p className="text-red-600 font-medium text-sm mt-1">
              {rejectionReason}
            </p>
            <p className="text-xs text-red-400 mt-2 font-bold uppercase tracking-wider">
              Please fix the issues below and update to resubmit.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmitHandler} className="space-y-8">
        {/* 📸 IMAGE UPLOAD SECTION */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <ImageIcon size={16} className="text-indigo-500" /> Media Gallery
          </h3>
          <div className="flex flex-wrap gap-4">
            {existingImages.map((img, i) => (
              <div
                key={`exist-${i}`}
                className="relative w-24 h-24 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm"
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt="Current"
                />
                <div className="absolute bottom-0 w-full bg-slate-900/60 text-white text-[10px] font-bold text-center py-0.5 backdrop-blur-sm">
                  Current
                </div>
              </div>
            ))}
            {files.map((file, index) => (
              <div
                key={`new-${index}`}
                className="relative group w-24 h-24 aspect-square"
              >
                <label
                  className={`cursor-pointer w-full h-full flex flex-col items-center justify-center rounded-2xl border-2 transition-all overflow-hidden ${file ? "border-transparent shadow-md" : "border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300"}`}
                >
                  <input
                    onChange={(e) => handleImageUpload(e, index)}
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, image/webp"
                  />
                  {file ? (
                    <img
                      className="w-full h-full object-cover"
                      src={URL.createObjectURL(file)}
                      alt="upload preview"
                    />
                  ) : (
                    <>
                      <Upload size={20} className="text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">
                        Replace
                      </span>
                    </>
                  )}
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-all"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-4 font-medium">
            Uploading new images will replace the existing ones.
          </p>
        </div>

        {/* 📝 CORE DETAILS SECTION */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Tag size={16} className="text-indigo-500" /> Core Details
          </h3>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Product Name
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                  Main Category{" "}
                  <span className="text-indigo-400 normal-case">
                    Type or Select
                  </span>
                </label>
                <input
                  list="category-list"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
                <datalist id="category-list">
                  {existingCategories.map((cat, i) => (
                    <option key={i} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                  Sub Category (Optional){" "}
                  <span className="text-indigo-400 normal-case">
                    Type or Select
                  </span>
                </label>
                <input
                  list="sub-category-list"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <datalist id="sub-category-list">
                  {existingSubCategories.map((sub, i) => (
                    <option key={i} value={sub} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Product Description
              </label>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* 💰 SMART PRICING SECTION */}
        <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-8 relative z-10 gap-4">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" /> Smart
              Pricing
            </h3>
            <label className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-emerald-200 shadow-sm cursor-pointer hover:bg-emerald-50 transition-colors w-full sm:w-auto">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={() => setHasVariants(!hasVariants)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-sm text-emerald-800 font-bold">
                Has Multiple Sizes?
              </span>
            </label>
          </div>

          <AnimatePresence mode="wait">
            {!hasVariants ? (
              <motion.div
                key="single"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative z-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex gap-1 items-center">
                      <Scale size={12} /> Unit / Size
                    </label>
                    <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={simpleWeightValue}
                        onChange={(e) => setSimpleWeightValue(e.target.value)}
                        className="w-1/2 px-4 py-3 outline-none text-sm font-medium bg-slate-50 border-r border-slate-200"
                        required={!hasVariants}
                      />
                      <select
                        value={simpleWeightUnit}
                        onChange={(e) => setSimpleWeightUnit(e.target.value)}
                        className="w-1/2 px-3 py-3 bg-slate-50 text-sm font-bold text-slate-700 outline-none cursor-pointer"
                      >
                        {Object.keys(UNIT_TYPES).map((group) => (
                          <optgroup key={group} label={group}>
                            {UNIT_TYPES[group].map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                      Your Net Earn (FCFA)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={netIncome}
                      onChange={(e) => setNetIncome(e.target.value)}
                      className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      required={!hasVariants}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Discount
                    </label>
                    <select
                      value={fakeDiscount}
                      onChange={(e) => setFakeDiscount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer shadow-sm"
                    >
                      {DISCOUNT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}% Off
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      <Eye size={12} className="inline mr-1" />
                      Customer Pays
                    </label>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm h-[46px]">
                      <span className="font-black text-blue-800 text-sm">
                        FCFA{listingPrice || 0}
                      </span>
                      {fakeMrp && (
                        <span className="text-[11px] font-bold text-slate-400 line-through">
                          FCFA{fakeMrp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="multi"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 relative z-10"
              >
                <div className="hidden md:grid grid-cols-12 gap-4 text-[11px] font-bold text-slate-400 px-6 uppercase tracking-widest">
                  <div className="col-span-3">Unit / Size</div>
                  <div className="col-span-3 text-emerald-600">
                    Net Earn (FCFA)
                  </div>
                  <div className="col-span-2">Discount</div>
                  <div className="col-span-3 text-blue-600">Cust Pays</div>
                  <div className="col-span-1"></div>
                </div>
                <AnimatePresence>
                  {variants.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-6 md:p-4 rounded-2xl border border-emerald-100 shadow-sm"
                    >
                      <div className="col-span-1 md:col-span-3 space-y-2 md:space-y-0">
                        <label className="md:hidden text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Size
                        </label>
                        <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.weightValue}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "weightValue",
                                e.target.value,
                              )
                            }
                            className="w-1/2 px-3 py-2.5 outline-none text-sm font-medium bg-slate-50 border-r border-slate-200"
                            required={hasVariants}
                          />
                          <select
                            value={item.weightUnit}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "weightUnit",
                                e.target.value,
                              )
                            }
                            className="w-1/2 px-2 py-2.5 bg-slate-50 text-sm font-bold text-slate-700 outline-none cursor-pointer"
                          >
                            {Object.keys(UNIT_TYPES).map((group) => (
                              <optgroup key={group} label={group}>
                                {UNIT_TYPES[group].map((u) => (
                                  <option key={u} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-3 space-y-2 md:space-y-0">
                        <label className="md:hidden text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                          Your Earn (FCFA)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.netIncome}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "netIncome",
                              e.target.value,
                            )
                          }
                          className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                          required={hasVariants}
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-2 md:space-y-0">
                        <label className="md:hidden text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Discount
                        </label>
                        <select
                          value={item.fakeDiscount}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "fakeDiscount",
                              e.target.value,
                            )
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer shadow-sm"
                        >
                          {DISCOUNT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}%
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 md:col-span-3 space-y-2 md:space-y-0">
                        <label className="md:hidden text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                          Customer Pays
                        </label>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm h-[42px]">
                          <span className="font-black text-blue-800 text-sm">
                            FCFA{item.listingPrice || 0}
                          </span>
                          {item.fakeMrp && (
                            <span className="text-[11px] font-bold text-slate-400 line-through">
                              FCFA{item.fakeMrp}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-1 flex justify-end">
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-2 md:mt-0"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-100/50 hover:bg-emerald-100 px-5 py-3 rounded-xl font-bold mt-4 transition-colors w-full sm:w-auto justify-center"
                >
                  <Plus size={16} /> Add Another Size
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* INFO & SUBMIT */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 w-full md:w-2/3">
            <div className="text-xs font-medium text-slate-500 space-y-2">
              <p className="flex items-center gap-2">
                <Info size={14} className="text-indigo-400" /> A{" "}
                {PLATFORM_FEE_PERCENT}% platform fee is automatically added to
                the customer's price.
              </p>
              <p className="flex items-center gap-2">
                <Truck size={14} className="text-cyan-500" /> Delivery charges
                are calculated at checkout and paid to the Rider.
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <button
              disabled={isLoading}
              className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {isLoading ? "SAVING..." : "UPDATE PRODUCT"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
