class APIFilters {
    constructor(query, queryStr) {
        this.query = query || []; // Make sure this.query is initialized as an array or the appropriate type
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword?
            {
                name: {
                    $regex: this.queryStr.keyword,
                    $options: "i"
                }
            } : {};
        this.query = this.query.find({ ...keyword });

        // Return the modified query
        // console.log(this.queryStr);
        // console.log('query ='+ this.query);
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };
        const fieldsToRemove = ['keyword','page','resPerPage'];
      
        fieldsToRemove.forEach((el) => delete queryCopy[el]);
      
        // Advance filter for price, rating, etc.
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
      
        return this;
      }

      pagination(resPerPage){
        const currentPage = Number(this.queryStr.page)||1;
        const skip = resPerPage * (currentPage-1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
      }
      
}

export default APIFilters;
