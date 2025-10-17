// JobCandidates.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Mail,
  CheckCircle,
  XCircle,
  Search,
  Users,
  Loader2,
} from "lucide-react";
import * as RecruitApi from "@/api/RecruitApi";

// --- Types based on Schemas ---

interface IReport {
  analysis: {
    overallScore: number;
  };
}

interface IApplicantData {
  _id: string; // Applicant Document ID
  structuredData: {
    name: string;
    email: string;
  };
}

interface IApplication {
  _id: string; // Application Document ID
  jobId: string;
  applicantId: string; // Applicant Document ID
  status:
    | "applied"
    | "interview_pending"
    | "interview_completed"
    | "selected"
    | "rejected";
}

interface CandidateData extends IApplication {
  applicantDetails: IApplicantData;
  report?: IReport;
  overallScore: number;
}

// --- API Mapping Functions (Proxies for RecruitApi) ---

// These map directly to your RecruitApi functions

const fetchApplicationsByJobId = (jobId: string): Promise<IApplication[]> => {
  return RecruitApi.getApplicationsByJob(jobId).then(
    (response) => response.applications || []
  );
};

const fetchApplicantDetails = (
  applicantId: string
): Promise<IApplicantData> => {
  // Assuming getApplicantProfile uses the Applicant Document ID as the route param
  return RecruitApi.getApplicantProfile(applicantId).then(
    (response) => response.applicant
  );
};

const fetchReportByApplicationId = (
  applicationId: string
): Promise<IReport | undefined> => {
  // The report API might return a 404/error if no report exists (interview not done)
  return RecruitApi.getReportByApplication(applicationId)
    .then((response) => response.report)
    .catch(() => undefined);
};

// --- Component ---
export function ViewCandiates() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    []
  );

  const fetchAllData = useCallback(async () => {
    if (!jobId) {
      toast.error("Error", { description: "Job ID is missing from the URL." });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const applications = await fetchApplicationsByJobId(jobId);

      const candidatePromises = applications.map(async (app) => {
        // Fetch details and report in parallel
        const [applicantResponse, report] = await Promise.all([
          fetchApplicantDetails(app.applicantId),
          fetchReportByApplicationId(app._id),
        ]);

        return {
          ...app,
          applicantDetails: applicantResponse,
          report: report,
          // Use optional chaining and nullish coalescing for safe score access
          overallScore: report?.analysis?.overallScore ?? 0,
        } as CandidateData;
      });

      const resolvedCandidates = await Promise.all(candidatePromises);

      // Sort by overallScore (highest first)
      const sortedCandidates = resolvedCandidates.sort(
        (a, b) => b.overallScore - a.overallScore
      );

      setCandidates(sortedCandidates);
    } catch (error) {
      console.error("Error fetching candidate data:", error);
      toast.error("Data Fetch Failed", {
        description: "Could not load applications or applicant details.",
      });
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Status Update Handlers ---

  const handleStatusChange = async (
    applicationId: string,
    newStatus: "selected" | "rejected"
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to change this applicant's status to '${newStatus}'?`
      )
    ) {
      return;
    }

    try {
      // API call using the correct data format
      await RecruitApi.updateApplicationStatus(applicationId, {
        status: newStatus,
      });
      toast.success("Success", {
        description: `Applicant successfully marked as ${newStatus}.`,
      });

      // Update the local state
      setCandidates((prev) =>
        prev.map((c) =>
          c._id === applicationId ? { ...c, status: newStatus } : c
        )
      );
    } catch (error) {
      toast.error("Update Failed", {
        description: "Could not update application status.",
      });
    }
  };

  // --- Selection and Mailing Handlers ---

  const handleSelectToggle = (id: string, isChecked: boolean) => {
    setSelectedCandidateIds((prev) =>
      isChecked ? [...prev, id] : prev.filter((appId) => appId !== id)
    );
  };

  const mailCandidates = (emails: string[]) => {
    if (emails.length === 0) {
      toast.warning("No Recipients", {
        description: "No emails available to send.",
      });
      return;
    }
    const emailString = emails.join(", ");
    // Use bcc for bulk mailing privacy
    window.location.href = `mailto:?bcc=${emailString}&subject=Update on your job application at [Your Company]`;
    toast.info("Mailing List Generated", {
      description: `Prepared email for ${emails.length} applicants.`,
    });
  };

  const handleMailAll = () => {
    const allEmails = candidates.map(
      (c) => c.applicantDetails.structuredData.email
    );
    mailCandidates(allEmails);
  };

  const handleMailSelected = () => {
    if (selectedCandidateIds.length === 0) {
      toast.warning("No Selection", {
        description: "Please select at least one candidate to mail.",
      });
      return;
    }
    const selectedEmails = candidates
      .filter((c) => selectedCandidateIds.includes(c._id))
      .map((c) => c.applicantDetails.structuredData.email);

    mailCandidates(selectedEmails);
  };

  // --- Memoized Filtered List ---
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates;

    const lowerCaseSearch = searchTerm.toLowerCase();
    return candidates.filter((candidate) =>
      candidate.applicantDetails.structuredData.name
        .toLowerCase()
        .includes(lowerCaseSearch)
    );
  }, [candidates, searchTerm]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
          <p>Loading candidates and interview reports...</p>
        </div>
      </>
    );
  }

  // --- Render ---
  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Applicants for Job ID: {jobId}
        </h2>

        {/* Controls and Search Bar */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 flex-grow max-w-sm">
              <Search className="text-gray-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search applicant by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3 ml-auto">
              <Button
                variant={showCheckboxes ? "default" : "outline"}
                onClick={() => setShowCheckboxes(!showCheckboxes)}
              >
                {showCheckboxes ? "Hide Selection" : "Select Candidates"}
              </Button>
              <Button variant="secondary" onClick={handleMailAll}>
                <Mail className="w-4 h-4 mr-2" />
                Mail All
              </Button>
              <Button
                variant="default"
                onClick={handleMailSelected}
                disabled={selectedCandidateIds.length === 0}
              >
                <Mail className="w-4 h-4 mr-2" />
                Mail Selected ({selectedCandidateIds.length})
              </Button>
            </div>
          </div>
        </Card>

        {/* Candidate Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {showCheckboxes && (
                  <TableHead className="w-[50px] text-center">Select</TableHead>
                )}
                <TableHead className="w-[300px]">
                  Applicant Name / Email
                </TableHead>
                <TableHead className="w-[100px] text-center">
                  AI Score
                </TableHead>
                <TableHead className="w-[150px] text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-gray-500"
                  >
                    No candidates found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate._id}>
                    {showCheckboxes && (
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedCandidateIds.includes(candidate._id)}
                          onCheckedChange={(checked) =>
                            handleSelectToggle(candidate._id, !!checked)
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      {candidate.applicantDetails.structuredData.name}
                      <div className="text-sm text-gray-500">
                        {candidate.applicantDetails.structuredData.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-lg">
                      {candidate.overallScore > 0 ? (
                        <span
                          className={`px-2 py-1 rounded-full text-white ${
                            candidate.overallScore >= 80
                              ? "bg-green-600"
                              : candidate.overallScore >= 60
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                        >
                          {candidate.overallScore}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                          candidate.status === "selected"
                            ? "bg-green-100 text-green-800"
                            : candidate.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {candidate.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/hr/applicant-profile/${candidate.applicantId}/${candidate._id}`
                          )
                        }
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(candidate._id, "selected")
                        }
                        disabled={
                          candidate.status === "selected" ||
                          candidate.status === "rejected"
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(candidate._id, "rejected")
                        }
                        disabled={
                          candidate.status === "rejected" ||
                          candidate.status === "selected"
                        }
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

export default ViewCandiates;
