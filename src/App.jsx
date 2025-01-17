import { useEffect, useRef, useState } from 'react'
import { Modal } from 'bootstrap'
import axios from 'axios'

console.clear();
const baseUrl = import.meta.env.VITE_BASE_URL;
const apiPath = import.meta.env.VITE_API_PATH;

// ============================================
// 登入元件
const SignIn = ({setToken,setExpired}) => {
  // 初始變數
  const [userInfo,setUserInfo] = useState({
    username:'',
    password:'',
  });
  const [messageLogIn,setMessageLogIn] = useState('');
  const [isErr,setIsErr] = useState(false);
  // 操作功能
  const handleUserInfoInput = (e) => {
    const {name,value} = e.target;
    setUserInfo({
      ...userInfo,
      [name]:value,
  });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post(`${baseUrl}/admin/signin`,userInfo);
        const {token,expired} = res.data;
        setToken(token);
        setExpired(expired);
        setIsErr(false);
      } catch (err) {
        setMessageLogIn(`登入失敗：${err.response?.data?.message||'原因不明'}`)
        setIsErr(true);
      }
  };

  return (
  <>
    <form className="signin-wrap w-25 mx-auto text-center" onSubmit={handleFormSubmit}>
      <h1 className='h3 mb-3'>請先登入</h1>
      <div className="form-floating mb-3">
        <input 
        type="email"
        name="username"
        className="form-control"
        id="floatingInput"
        placeholder="name@example.com"
        onChange={handleUserInfoInput}
        value={userInfo.username}
        />
        <label htmlFor="floatingInput">信箱</label>
      </div>
      <div className="form-floating mb-3">
        <input
        type="password"
        name="password"
        className="form-control" 
        id="floatingPassword" 
        placeholder="Password"
        onChange={handleUserInfoInput}
        value={userInfo.password}
        />
        <label htmlFor="floatingPassword">密碼</label>
      </div>
      <button className='btn btn-primary w-100 p-2 mb-2'>登入</button>
      {
        messageLogIn && <p className='text-danger'>{messageLogIn}</p>
      }
    </form>
    <p className='text-muted mt-5 text-center'>&copy;嚼勁先生</p>
  </>
  )
}; 

// ============================================
// 後台產品管理元件
const ProductsManage = ({token}) => {
  axios.defaults.headers.common['Authorization'] = token;
  // 登入驗證 API
  const checkLogIn = () => {
    (async () => {
      try {
        await axios.post(`${baseUrl}/api/user/check`);
        alert('您已經登入');
      } catch (err) {
        console.log(err.response?.data?.message);
      }
    })();
  };
  // 取得產品列表 API
  const [productsData,setProductsData] = useState([]);
  const [productDetail,setProductDetail] = useState(null);
  console.log(productDetail);
  
  
  const getProductsData = async() => {
    try {
      const res = await axios.get(`${baseUrl}/api/${apiPath}/admin/products/all`);
      setProductsData(Object.values(res.data.products));
    } catch (err) {
      console.log(err.response?.data?.message);
    }
  };

  useEffect(()=>{
    getProductsData();
  },[token]);

  // 新增產品資料 API
  const [productInfo,setProductInfo]=useState({
    title: "",
    category: "",
    origin_price:0,
    price: 0,
    unit: "",
    description: "",
    content: "",
    is_enabled: 1,
    imageUrl: "",
    imagesUrl:[],
  });
  const addProductModalRef = useRef(null);
  const newAddProductModalRef = useRef(null);
  const openAddProductModal = ()=>{
    newAddProductModalRef.current.show();
    setProductInfo({
      title:"",
      category:"",
      origin_price:0,
      price:0,
      unit:"",
      description:"",
      content:"",
      is_enabled: 1,
      imageUrl:"",
      imagesUrl:[],
    });
  };
  

  useEffect(()=>{
    newAddProductModalRef.current = new Modal(addProductModalRef.current);
  },[]);

  const postProductData = async () => {
    const updateData = {
      data:productInfo
    };
    
    try {
      const res = await axios.post(`${baseUrl}/api/${apiPath}/admin/product`,updateData);
      alert(res.data.message);
      getProductsData();
      newAddProductModalRef.current.hide();
    } catch (err) {
      console.log(err.response?.data?.message);
    }
  };

  // 刪除產品資料 API
  const removeProductsData = async (id) => {
    try {
      const res = await axios.delete(`${baseUrl}/api/${apiPath}/admin/product/${id}`);
      alert(res.data.message)
      getProductsData();
    } catch (err) { 
      console.log(err.response?.data?.message);
    }
  };

  // 編輯產品資料 API
  const editProductModalRef = useRef(null);
  const newEditProductModalRef = useRef(null);
  const openEditProductModal = (product) => {
    newEditProductModalRef.current.show();
    const imagesUrlFilter = product.imagesUrl.filter(img => img !=='');
    const productFilter = {...product,imagesUrl:imagesUrlFilter};
    setProductInfo({
      id:productFilter.id,
      title:productFilter.title,
      category:productFilter.category,
      origin_price:productFilter.origin_price,
      price:productFilter.price,
      unit:productFilter.unit,
      description:productFilter.description,
      content:productFilter.content,
      is_enabled: productFilter.is_enabled,
      imageUrl:productFilter.imageUrl,
      imagesUrl:productFilter.imagesUrl,
    });
  };
  useEffect(()=>{
    newEditProductModalRef.current = new Modal(editProductModalRef.current);
  },[]);

  
  const putProductsData = async (id) => {
    const updateData = {
      data:productInfo
    };
    try {
      const res = await axios.put(`${baseUrl}/api/${apiPath}/admin/product/${id}`,updateData);
      alert(res.data.message);
      getProductsData();
      newEditProductModalRef.current.hide();
    } catch (err) {
      console.log(err.response?.data?.message);
    }
  };

  return (
  <>
  <div className="container">
    <div className="btn-wrap d-flex justify-content-end">
      <div className="btn-group ">
        <button type="button" className='btn btn-warning' onClick={openAddProductModal}>新增產品</button>
        <button type="button" className='btn btn-outline-warning ' onClick={checkLogIn}>登入驗證</button>
      </div>
    </div>
    <AddProductModal addProductModalRef={addProductModalRef} newAddProductModalRef={newAddProductModalRef}  setProductInfo={setProductInfo} productInfo={productInfo} postProductData={postProductData} />
    <EditProductModal editProductModalRef={editProductModalRef} newEditProductModalRef={newEditProductModalRef} setProductInfo={setProductInfo} productInfo={productInfo} putProductsData={putProductsData}/>

    <div className="row my-3 g-4 flex-wrap">
      <div className="col-xxl-8 text-nowrap">
        <h2>產品列表</h2>
        <table className="table">
          <thead>
            <tr>
              <th>品名</th>
              <th>原價</th>
              <th>售價</th>
              <th>狀態</th>
              <th>預覽</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {
              productsData.length >0 ?(
                <>
                {
                  productsData.map(product => {
                  const {id,title,origin_price,price,is_enabled} = product;
                    
                  return <tr key={id}>
                    <td>{title}</td>
                    <td>{origin_price}</td>
                    <td>{price}</td>
                    <td>{is_enabled?'啟用':'未啟用'}</td>
                    <td><button type="button" className='btn btn-info'
                    onClick={() => setProductDetail(product)}
                    >查看</button></td>
                    <td>
                      <div className="btn-group">
                        <button type="button" className='btn btn-success'
                        onClick={()=>openEditProductModal(product)}
                        >編輯</button>
                        <button
                        type="button"
                        className='btn btn-danger'
                        onClick={() => removeProductsData(id)}
                        >刪除</button>
                      </div>
                    </td>
                  </tr>
                  }
                  )
                }
                </>
              ):(
                <><tr><td colSpan={5}>尚無產品資料</td></tr></>
              )
            }
          </tbody>
        </table>
      </div>
      <div className="col-xxl-4">
        <h2>預覽產品</h2>
        {
          productDetail?(
            <>
            <Card productDetail={productDetail}/>
            </>
          ):(
            <>
              <p>請選擇一個產品預覽</p>
            </>
          )
        }
      </div>
    </div>
  </div>
  </>
  )
};

// ============================================
// 卡片元件
const Card = ({productDetail}) => {
  const {imageUrl,title,category,description,content,origin_price,price,imagesUrl} = productDetail;
  return(
  <>
  <div className="card">
    <img src={imageUrl} className="card-img-top" alt="產品主圖"/>
    <div className="card-body">
      <h5 className="card-title">{title}<span className="badge text-bg-primary ms-2">{category}</span></h5>
      <p className="card-text">商品描述：{description}</p>
      <p className="card-text">商品詳情：{content}</p>
      <div className='mb-3'><del className='text-muted'>{origin_price}</del><span> / {price}</span></div>
      <h5>更多圖片</h5>
      <div className="row g-4">
        {
          imagesUrl
          .filter(img=>img !==null)
          .map((img,index)=>
            <div className="col-6" key={index}>
              <div className="img-wrap">
                <img src={img} alt="產品附圖" className='img-cover'/>
              </div>
            </div>
          )
        }
      </div>
    </div>
  </div>
  </>
  )
};

// ============================================
// Loading元件
const Loading = () => {
  return (
  <>
  <div className="loginIcon d-flex justify-content-center">
    <div className="spinner-border text-success" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <span className='ms-2 text-success'>請稍待片刻...</span>
  </div>
  </>
  )
};

// ============================================
// Modal
// 新增產品資料元件
const AddProductModal = ({addProductModalRef,newAddProductModalRef,productInfo,setProductInfo,postProductData} ) => {
  
  const {title,category,origin_price,price,unit,description,content,is_enabled,imageUrl} = productInfo;
  
  const handleProductInfoInput = (e) => {
    const {name,value,type,checked} = e.target;
    setProductInfo(prev => ({
      ...prev,
      [name]: type==='checkbox'? checked : (type === 'number'? Number(value):value),
    }));
  };

  const addNewImg = () => {
    setProductInfo(prev => ({
      ...prev,
      imagesUrl:[...prev.imagesUrl,''],
    }));
    
  };

  const removeNewImg = () => {
    setProductInfo(prev => {
      const newImg = [...prev.imagesUrl];
      newImg.pop();
      return {...prev,imagesUrl:newImg}
    });
    
  };

  const handleImgInput = (index,value) => {
    setProductInfo(prev => {
      const newImgArr = [...prev.imagesUrl];
      newImgArr[index]=value;
      return {...productInfo,imagesUrl:newImgArr}
    });

  };
  
  const closeAddProductModal = ()=>{
    newAddProductModalRef.current.hide();
  };
  return (
    <>
    <div className="modal fade"tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" ref={addProductModalRef}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title" id="staticBackdropLabel">新增劇會</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={closeAddProductModal}></button>
          </div>
          <div className="modal-body">
            <div className="row gy-4">
              <div className="col-4">
                <div>
                  <div>
                    <label htmlFor='imgInput' className='form-label'>劇會主圖</label>
                    <input
                    type="text"
                    id='imgInput'
                    name='imageUrl'
                    className='form-control'
                    placeholder='貼上圖片網址'
                    value={imageUrl}
                    onChange={handleProductInfoInput}
                    />
                  </div>
                  {
                    imageUrl&&
                    <img src={imageUrl} alt="劇會主圖" style={{width:'100%'}} className='mt-2' />
                  }
                </div>
                {
                  imageUrl !==''&& productInfo.imagesUrl.length ==0 &&
                (<button type="button" className='btn btn-outline-success w-100 mt-2' onClick={addNewImg}>新增副圖</button>)
                }
                
                {
                  (productInfo.imagesUrl.map((img,index)=>
                    <div key={index} className='my-4'>
                      <input
                      type="text"
                      className='form-control'
                      placeholder={`貼上圖片網址${index+1}`}
                      value={img}
                      onChange={(e)=>handleImgInput(index,e.target.value)}
                      />
                      {
                        img&&
                        <img src={img} alt={`副圖${index+1}`} style={{width:'100%'}} className='mt-2'/>
                      }
                      <div className="d-flex">
                        {
                          productInfo.imagesUrl[index]&&productInfo.imagesUrl.length<5 && (productInfo.imagesUrl.length-1)==index &&
                          (<button type="button" className='btn btn-outline-success w-100 mt-2 ms-1 me-1' onClick={addNewImg}>新增副圖</button>)
                        }
                        <button type="button" className='btn btn-outline-danger w-100 mt-2 ms-1 me-1' onClick={removeNewImg}>取消圖片</button>
                      </div>
                    </div>
                  ))
                }
              </div>
              <div className="col-8">
                <div>
                  <label htmlFor='titleInput' className='form-label'>劇會標題</label>
                  <input
                  type="text"
                  id='titleInput'
                  name='title'
                  className='form-control'
                  placeholder='請輸入標題'
                  value={title}
                  onChange={handleProductInfoInput}
                  />
                </div>
                <div className="row gy-4 mt-2">
                  <div className="col-6">
                    <div>
                      <label htmlFor='categoryInput' className='form-label'>劇會分類</label>
                      <input
                      type="text"
                      id='categoryInput'
                      name='category'
                      className='form-control'
                      placeholder='請輸入分類'
                      value={category}
                      onChange={handleProductInfoInput}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div>
                      <label htmlFor='unitInput' className='form-label'>劇會單位</label>
                      <input
                      type="text"
                      id='unitInput'
                      name='unit'
                      className='form-control'
                      placeholder='請輸入單位'
                      value={unit}
                      onChange={handleProductInfoInput}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div>
                      <label htmlFor='originPriceInput' className='form-label'>劇會原價</label>
                      <input
                      type="number"
                      id='originPriceInput'
                      name='origin_price'
                      className='form-control'
                      placeholder='請輸入原價'
                      value={origin_price}
                      onChange={handleProductInfoInput}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div>
                      <label htmlFor='priceInput' className='form-label'>劇會售價</label>
                      <input
                      type="number"
                      id='priceInput'
                      name='price'
                      className='form-control'
                      placeholder='請輸入售價'
                      value={price}
                      onChange={handleProductInfoInput}
                      />
                    </div>
                  </div>
                  <hr />
                </div>
                <div className='mb-4'>
                  <label htmlFor='descriptionInput' className='form-label '>劇會簡述</label>
                  <textarea
                  type="text"
                  id='descriptionInput'
                  name='description'
                  className='form-control'
                  style={{height:'100px'}}
                  placeholder='請輸入簡述'
                  value={description}
                  onChange={handleProductInfoInput}
                  />
                </div>
                <div className='mb-2'>
                  <label htmlFor='contentInput' className='form-label'>劇會詳情</label>
                  <textarea
                  type="text"
                  id='contentInput'
                  name='content'
                  className='form-control'
                  style={{height:'100px'}}
                  placeholder='請輸入詳情'
                  value={content}
                  onChange={handleProductInfoInput}
                  />
                </div>
                <div className="form-check mt-4">
                  <input
                  className="form-check-input"
                  type="checkbox"
                  id="checkInput"
                  name='is_enabled'
                  checked={is_enabled}
                  onChange={handleProductInfoInput}
                  />
                  <label className="form-check-label" htmlFor="checkInput">
                  是否發佈
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-warning" onClick={postProductData}>確認</button>
            <button type="button" className="btn btn-secondary" onClick={closeAddProductModal}>取消</button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
};

// 編輯產品資料元件
const EditProductModal =({editProductModalRef,newEditProductModalRef,setProductInfo,productInfo,putProductsData}) => {

  const {title,category,origin_price,price,unit,description,content,is_enabled,imageUrl,id} = productInfo;
  
  const closeEditProductModal = () => {
    newEditProductModalRef.current.hide();
  };
  const handleProductInfoInput = (e) => {
    const {name,value,type,checked} = e.target;
    setProductInfo(prev => ({
      ...prev,
      [name]: type==='checkbox'? checked : (type === 'number'? Number(value):value),
    }));
  };

  const addNewImg = () => {
    setProductInfo(prev => ({
      ...prev,
      imagesUrl:[...prev.imagesUrl,''],
    }));
    
  };

  const removeNewImg = () => {
    setProductInfo(prev => {
      const newImg = [...prev.imagesUrl];
      newImg.pop();
      return {...prev,imagesUrl:newImg}
    });
    
  };

  const handleImgInput = (index,value) => {
    setProductInfo(prev => {
      const newImgArr = [...prev.imagesUrl];
      newImgArr[index]=value;
      return {...productInfo,imagesUrl:newImgArr}
    });

  };
  
  
  return(
  <>
  <div className="modal fade"tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" ref={editProductModalRef}>
    <div className="modal-dialog modal-xl">
      <div className="modal-content">
        <div className="modal-header bg-success text-white">
          <h5 className="modal-title" id="staticBackdropLabel">編輯劇會</h5>
          <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={closeEditProductModal}></button>
        </div>
        <div className="modal-body">
          <div className="row gy-4">
            <div className="col-4">
              <div>
                <div>
                  <label htmlFor='imgInput' className='form-label'>劇會主圖</label>
                  <input
                  type="text"
                  id='imgInput'
                  name='imageUrl'
                  className='form-control'
                  placeholder='貼上圖片網址'
                  value={imageUrl}
                  onChange={handleProductInfoInput}
                  />
                </div>
                {
                  imageUrl&&
                  <img src={imageUrl} alt="劇會主圖" style={{width:'100%'}} className='mt-2' />
                }
              </div>
              {
                imageUrl !==''&& productInfo.imagesUrl.length ==0 &&
              (<button type="button" className='btn btn-outline-success w-100 mt-2' onClick={addNewImg}>新增副圖</button>)
              }
              
              {
                (productInfo.imagesUrl.map((img,index)=>
                  <div key={index} className='my-4'>
                    <input
                    type="text"
                    className='form-control'
                    placeholder={`貼上圖片網址${index+1}`}
                    value={img}
                    onChange={(e)=>handleImgInput(index,e.target.value)}
                    />
                    {
                      img&&
                      <img src={img} alt={`副圖${index+1}`} style={{width:'100%'}} className='mt-2'/>
                    }
                    <div className="d-flex">
                      {
                        productInfo.imagesUrl[index]&&productInfo.imagesUrl.length<5 && (productInfo.imagesUrl.length-1)==index &&
                        (<button type="button" className='btn btn-outline-success w-100 mt-2 ms-1 me-1' onClick={addNewImg}>新增副圖</button>)
                      }
                      <button type="button" className='btn btn-outline-danger w-100 mt-2 ms-1 me-1' onClick={removeNewImg}>取消圖片</button>
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="col-8">
              <div>
                <label htmlFor='titleInput' className='form-label'>劇會標題</label>
                <input
                type="text"
                id='titleInput'
                name='title'
                className='form-control'
                placeholder='請輸入標題'
                value={title}
                onChange={handleProductInfoInput}
                />
              </div>
              <div className="row gy-4 mt-2">
                <div className="col-6">
                  <div>
                    <label htmlFor='categoryInput' className='form-label'>劇會分類</label>
                    <input
                    type="text"
                    id='categoryInput'
                    name='category'
                    className='form-control'
                    placeholder='請輸入分類'
                    value={category}
                    onChange={handleProductInfoInput}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div>
                    <label htmlFor='unitInput' className='form-label'>劇會單位</label>
                    <input
                    type="text"
                    id='unitInput'
                    name='unit'
                    className='form-control'
                    placeholder='請輸入單位'
                    value={unit}
                    onChange={handleProductInfoInput}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div>
                    <label htmlFor='originPriceInput' className='form-label'>劇會原價</label>
                    <input
                    type="number"
                    id='originPriceInput'
                    name='origin_price'
                    className='form-control'
                    placeholder='請輸入原價'
                    value={origin_price}
                    onChange={handleProductInfoInput}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div>
                    <label htmlFor='priceInput' className='form-label'>劇會售價</label>
                    <input
                    type="number"
                    id='priceInput'
                    name='price'
                    className='form-control'
                    placeholder='請輸入售價'
                    value={price}
                    onChange={handleProductInfoInput}
                    />
                  </div>
                </div>
                <hr />
              </div>
              <div className='mb-4'>
                <label htmlFor='descriptionInput' className='form-label '>劇會簡述</label>
                <textarea
                type="text"
                id='descriptionInput'
                name='description'
                className='form-control'
                style={{height:'100px'}}
                placeholder='請輸入簡述'
                value={description}
                onChange={handleProductInfoInput}
                />
              </div>
              <div className='mb-2'>
                <label htmlFor='contentInput' className='form-label'>劇會詳情</label>
                <textarea
                type="text"
                id='contentInput'
                name='content'
                className='form-control'
                style={{height:'100px'}}
                placeholder='請輸入詳情'
                value={content}
                onChange={handleProductInfoInput}
                />
              </div>
              <div className="form-check mt-4">
                <input
                className="form-check-input"
                type="checkbox"
                id="checkInput"
                name='is_enabled'
                checked={is_enabled}
                onChange={handleProductInfoInput}
                />
                <label className="form-check-label" htmlFor="checkInput">
                是否發佈
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-success" onClick={()=>putProductsData(id)}>確認</button>
          <button type="button" className="btn btn-secondary" onClick={closeEditProductModal}>取消</button>
        </div>
      </div>
    </div>
  </div>
  </>
  )
};



// ============================================
// 父元素元件
function App() {
  const [token,setToken] = useState('');
  const [expired,setExpired] = useState('');
  const [isLogin,setIsLogin] = useState(false);
  document.cookie = `myToken=${token}; expires=${new Date(expired)}`;
  if(token){
    setTimeout(()=>{
      setIsLogin(true);
    },2000);
  };
  
  return (
    <>
    {
      token?(
        isLogin?(
          <ProductsManage token={token}/>
        ):(
          <Loading />
        )
      ):(
        <SignIn setToken={setToken} setExpired={setExpired}/>
      )
    }
    </>
  )
}

export default App
