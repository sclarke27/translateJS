using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;

namespace DemoTranslatorPage
{

    public class AdmAccessToken
    {
        public string access_token { get; set; }
        public string token_type { get; set; }
        public string expires_in { get; set; }
        public string scope { get; set; }
    } 


    public partial class _Index : System.Web.UI.Page
    {
        private static String clientID = "TranslatorJS-demo";
        private static String clientSecret = "0C1gBGU2aG9sDkLcklDcOScP9/6XOVPVRWHonHE0tHE=";
        private static String strTranslatorAccessURI = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13";
        private static String strRequestDetails = string.Format("grant_type=client_credentials&client_id={0}&client_secret={1}&scope=http://api.microsofttranslator.com", HttpUtility.UrlEncode(clientID), HttpUtility.UrlEncode(clientSecret));

        protected void Page_Load(object sender, EventArgs e)
        {
            AdmAccessToken token = FetchAccessToken();
            Response.Write(string.Format(@"
                <script type=""text/javascript"">
                    window.accessToken = ""{0}"";
                </script>", token.access_token));
            
        }

        private AdmAccessToken FetchAccessToken()
        {
            System.Net.WebRequest webRequest = System.Net.WebRequest.Create(strTranslatorAccessURI);
            webRequest.ContentType = "application/x-www-form-urlencoded";
            webRequest.Method = "POST";

            byte[] bytes = System.Text.Encoding.ASCII.GetBytes(strRequestDetails);
            webRequest.ContentLength = bytes.Length;
            using (System.IO.Stream outputStream = webRequest.GetRequestStream())
            {
                outputStream.Write(bytes, 0, bytes.Length);
            }
            System.Net.WebResponse webResponse = webRequest.GetResponse();

            System.Runtime.Serialization.Json.DataContractJsonSerializer serializer = new System.Runtime.Serialization.Json.DataContractJsonSerializer(typeof(AdmAccessToken));
            //Get deserialized object from JSON stream 
            AdmAccessToken token = (AdmAccessToken)serializer.ReadObject(webResponse.GetResponseStream());

            //string headerValue = "Bearer " + token.access_token;
            return token;

        }
    }
}