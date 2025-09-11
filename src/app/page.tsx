"use client"
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import moment from "jalali-moment";

export default function Home() {

  const [fileName, setFileName] = useState("");
  const [pairs, setPairs] = useState<any[]>([]);
  const [html2pdf, setHtml2pdf] = useState<any>(null);
  const [XLSX, setXLSX] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const h2p = (await import("html2pdf.js")).default;
      const xlsx = await import("xlsx");
      setHtml2pdf(() => h2p);
      setXLSX(xlsx);
    })();
  }, []);

  const onFileSelected = (e: any) => {
    if (!XLSX) return;
    const file = e.target.files[0];
    console.log(file);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryString = e.target.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const dt: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: true }) ?? [];

      // Create pairs without mutating dt
      const chunkSize = 9;
      const chunked: any[] = [];
      for (let i = 0; i < dt.length; i += chunkSize) {
        chunked.push(dt.slice(i, i + chunkSize));
      }

      setPairs(chunked);
    };

    if (file) {
      reader.readAsBinaryString(file);
    }
  };

  const onDownload = () => {
    if (!html2pdf) return;
    const pageBreak = { mode: 'css', before: '.before', after: '.after', avoid: '.avoid' };

    let options = {
      filename: "report.pdf",
      image: { type: 'jpeg', quality: 1, margin: 0 },
      html2canvas: { scale: 2, dpi: 96, logging: true, scrollX: 0, scrollY: -window.scrollY },
      pagebreak: pageBreak,
      jsPDF: { format: [1123, 794], orientation: 'landscape', putOnlyUsedFonts: true, precision: 1, unit: "px" }
    };

    const element = document.getElementById("_monitor"); // container with all pairs

    if (element) {
      html2pdf()
        .set(options)
        .from(element)
        .toPdf()
        .get('pdf')
        .then((pdf: any) => {
          pdf.setProperties({ title: "G5 WORDS" });
          let pdfData = pdf.output('arraybuffer');
          let pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
          let blobURL = URL.createObjectURL(pdfBlob);
          window.open(blobURL, '_blank');
        });
    }
  };



  const convertToPersianDateOfficial = (): string => {
    try {
      const jalaliDate = moment(new Date()).locale('fa'); // Set locale to Persian

      // Format parts with zero-padding
      const year = jalaliDate.format('YYYY'); // Persian year
      const month = jalaliDate.format('MM'); // Persian month (zero-padded)
      const day = jalaliDate.format('DD'); // Day of the month (zero-padded)

      return `${year}/${month}/${day}`;
    } catch (error) {
      console.error(error);
      return "";
    }
  }

  return (
    <>
      <div className={`${styles.formBox}`}>
        <label className={`${styles.upload}`}>
          <input type="file" style={{ display: "none" }} onChange={onFileSelected} accept=".xlsx, .xls" />
          <i className={`${styles.uploadLabel}`}>Upload</i>
        </label>
        <div className={`${styles.details}`}>
          <p className={`${styles.info}`}>Uploaded File: {fileName} </p>
          <p className={`${styles.info}`}>G5 Cards: {(pairs.length ?? 0) * 9}</p>
          <p className={`${styles.info}`}>Required Paper: {pairs.length ?? 0}</p>
        </div>
        {
          pairs && pairs.length > 0 &&
          <button className={`${styles.downloadButton}`} onClick={() => onDownload()}>Download</button >
        }
      </div>
      <div className={`${styles.box}`} id="_monitor">
        {
          pairs.map((pair: any, index: number) => <>
            <div key={`pp${index}`} id={`flex_${index}`} className={`${styles.printArea}`} >
              <div className={`${styles.paper}`} >
                <ul className={`${styles.wordsList}`} >
                  {
                    pair.map((g: any, index: number) =>
                      <li key={`ww${index}`} className={`${styles.word}`}>
                        <p>{g.word} <br></br> <small>{g.pronunciation}</small></p>
                        <i>{g.language}</i>
                      </li>
                    )
                  }
                </ul >
              </div >
              <div className={`${styles.paper}`} >
                <ul className={`${styles.translateList}`} >
                  {
                    pair.map((g: any, index: number) =>
                      <li key={`tt-${index}`} className={`${styles.translate}`} >
                        {g.translate}
                        <i>{convertToPersianDateOfficial()}</i>
                      </li>
                    )
                  }

                </ul>
              </div >
            </div >
          </>)
        }
      </div>
    </>
  );
}
