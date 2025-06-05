//  utils/dateUtils.js

const data_utils = {

    //** 시간 단위 변경 */
    date_before : (create_Date) => {
        const last_time = new Date - new Date(create_Date);
    
        const before_minutes = Math.floor(last_time / (1000*60)) 
        const before_times = Math.floor(last_time / (1000*60*60)) 
        const before_days = Math.floor(last_time / (1000*60*60*24)) 
        const before_months = Math.floor(before_days / 30)
        const before_years = Math.floor(before_days / 365)
        
        if(before_minutes < 1){
            return "방금 전";
        } else if(before_minutes < 60){
            return before_minutes +"분 전";
        } else if (before_times < 24){
            return before_times+"시간 전";
        }else if (before_days < 30){
            return before_days + "일 전";
        }else if ( before_months < 12){
            return before_months+"달 전";
        }else{
            return before_years+"년 전";
        }
    },

    //** 게시판명 변경 */
    content_type_string : (record) => {
        record.forEach(row => {
            switch (row.content_type) {
                case 'qa'   :  row.post_name ='질문';
                break;
                case 'info' :  row.post_name ='정보';
                break;
                default     :  row.post_name ='생활';
            }
        });
        return record;
    },

    //** 댓글 비공개 처리 */
    change_delete_comment_text : (list) => {
        let change_count = 0;
        list
            .filter( row => row.visible.toString('hex') === '00' )
            .forEach( row => {
                row.comment = "블라인드 처리된 글입니다.";
                change_count+=1;
            });
        return { list, change_count };
    },

    //**  1000 단위 변경 */
    content_count_change : (value) => {
        var result;

        if( 1000 <= value ){
            const count_k = Math.trunc( value / 1000 * 10 );
            result = count_k / 10 + 'k';
        }else{
            result = value;
        }
        
        return result;
    },

    XSS_check_string : (text) => {
        const { JSDOM } = require('jsdom');
        const DOMPurify = require('dompurify');
        const window_object = new JSDOM('').window;
        const objectDOMPurify = DOMPurify(window_object);
    
        if(text){
            const check_text = objectDOMPurify.sanitize(text);
            return check_text;
        }
    }
}


module.exports = data_utils;