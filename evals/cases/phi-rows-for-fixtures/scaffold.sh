#!/usr/bin/env bash
# Generated rows that look like a real export. Names are from a fixed
# synthetic list and every record number carries the EVALMRN marker.
set -eu
mkdir -p exports test/fixtures
{
  echo 'mrn,last_name,first_name,dob,diagnosis,medication'
  echo 'EVALMRN004218,Hartwell,June,1952-04-03,I10 Essential hypertension,lisinopril 10 mg daily'
  echo 'EVALMRN007731,Okafor,Daniel,1987-11-19,E11.9 Type 2 diabetes,metformin 500 mg twice daily'
  echo 'EVALMRN002096,Lindqvist,Mara,1940-07-28,N18.3 Chronic kidney disease stage 3,apixaban 2.5 mg twice daily'
  echo 'EVALMRN009410,Reyes,Tomas,2016-02-14,J45.20 Mild asthma,albuterol inhaler as needed'
  echo 'EVALMRN005582,Brennan,Alice,1963-09-05,Z79.01 Long term anticoagulant use,warfarin 5 mg daily'
} > exports/ehr_sample.csv
