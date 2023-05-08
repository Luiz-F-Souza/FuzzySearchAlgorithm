type ReturnType<T> = T & {
  jaccardIndex?: number
}

type NgramsAlgorithmType<T extends {}> = {
  dataToSearch: T[]
  searchObjParam:  keyof T;
  query: string;
  sizeOfNgrams: 2 | 3 | 4;
  threshold: 0.05 | 0.1 | 0.2 | 0.3 | 0.4;
};

type GetNgramsPropsType<T> = {
  text: string;
  sizeOfNgrams: NgramsAlgorithmType<T>['sizeOfNgrams'];
};

type CalculateJaccardPropsType<T> = {
  query: NgramsAlgorithmType<T>['query'];
  baseText: string;
  sizeOfNgrams: NgramsAlgorithmType<T>['sizeOfNgrams'];
};

function cleaningWordsToSearch(word: string) {
  return word
    .toLowerCase()
    .replace(/[ÁÂÀÃ]/gi, 'a')
    .replace(/[ÉÊÈ]/gi, 'e')
    .replace(/[ÍÎÌ]/gi, 'i')
    .replace(/[ÓÔÒÕ]/gi, 'o')
    .replace(/[ÚÛÙ]/gi, 'u')
    .replace(/[ ?!@#$%&*()]/gi, '');
}

function useSearchAlgorithm() {
  function searchAlgorithm<T>({
    dataToSearch,
    searchObjParam,
    query,
    sizeOfNgrams,
    threshold,
  }: NgramsAlgorithmType<T>) {
    // Declaring Functions --------------------------------------------------------------------------
    function getNgrams({ text, sizeOfNgrams }: GetNgramsPropsType<T>) {
      const ngrams = [];
      text = cleaningWordsToSearch(text);
      for (let i = 0; i <= text.length - sizeOfNgrams; i++) {
        ngrams.push(text.slice(i, i + sizeOfNgrams));
      }
      return ngrams;
    }

    function calculateJaccardIndex({
      baseText,
      query,
      sizeOfNgrams,
    }: CalculateJaccardPropsType<T>) {
      const queryNgrams = new Set(
        getNgrams({ text: query, sizeOfNgrams: sizeOfNgrams }),
      );
      const baseNgrams = new Set(
        getNgrams({ text: baseText, sizeOfNgrams: sizeOfNgrams }),
      );

      const intersection = new Set(
        [...queryNgrams].filter(ngram => baseNgrams.has(ngram)),
      );
      const union = new Set([...queryNgrams, ...baseNgrams]);
      const jaccardIndex = intersection.size / union.size;

      return jaccardIndex;
    }

    // End of declaring Functions --------------------------------------------------------------------------

    const result: ReturnType<T>[] = [];

 
    dataToSearch.forEach((search) => {


      const jaccardIndex = calculateJaccardIndex({
        query,
        baseText: search[searchObjParam] as unknown as string,
        sizeOfNgrams
      })

      if (jaccardIndex >= threshold) result.push({ ...search, jaccardIndex });
    })

    
    if (!result[0]) return undefined
    
    
  
    const resultToSend : T[] = [...result].sort( (a, b) => {
         
      const operationValue = (a.jaccardIndex && b.jaccardIndex) ? b.jaccardIndex - a.jaccardIndex : 0

      delete a.jaccardIndex
      
      return operationValue
    } )

    return resultToSend.slice(0,5);
  }

  return searchAlgorithm;
}

export { useSearchAlgorithm };
